package com.finance.app.service;
import com.finance.app.dto.TransactionDtos.*;
import com.finance.app.entity.*;
import com.finance.app.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
@Service
public class TransactionService {
    private final TransactionRepository repo;
    public TransactionService(TransactionRepository r){repo=r;}
    public Response create(User user, CreateRequest req){
        Transaction t = Transaction.builder().user(user).type(req.type()).category(req.category())
            .amount(req.amount()).note(req.note()).date(req.date()).build();
        return toDto(repo.save(t));
    }
    public List<Response> list(User user){
        return repo.findByUserIdOrderByDateDesc(user.getId()).stream().map(this::toDto).toList();
    }
    public void delete(User user, Long id){
        Transaction t = repo.findById(id).orElseThrow();
        if(!t.getUser().getId().equals(user.getId())) throw new RuntimeException("Forbidden");
        repo.delete(t);
    }
    public Summary summary(User user){
        var list = repo.findByUserIdOrderByDateDesc(user.getId());
        BigDecimal income = list.stream().filter(t->t.getType()==TransactionType.INCOME)
            .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal expense = list.stream().filter(t->t.getType()==TransactionType.EXPENSE)
            .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Summary(income, expense, income.subtract(expense));
    }
    public Insights insights(User user){
        LocalDate today = LocalDate.now();
        LocalDate thisMonthStart = today.withDayOfMonth(1);
        LocalDate nextMonthStart = thisMonthStart.plusMonths(1);
        LocalDate lastMonthStart = thisMonthStart.minusMonths(1);

        BigDecimal thisIncome = repo.sumByUserAndTypeAndDateBetween(
            user.getId(), TransactionType.INCOME, thisMonthStart, nextMonthStart);
        BigDecimal thisExpense = repo.sumByUserAndTypeAndDateBetween(
            user.getId(), TransactionType.EXPENSE, thisMonthStart, nextMonthStart);
        BigDecimal lastExpense = repo.sumByUserAndTypeAndDateBetween(
            user.getId(), TransactionType.EXPENSE, lastMonthStart, thisMonthStart);

        BigDecimal savings = thisIncome.subtract(thisExpense);

        double changePercent = 0;
        String trend = "stable";
        if (lastExpense.compareTo(BigDecimal.ZERO) > 0) {
            changePercent = thisExpense.subtract(lastExpense)
                .divide(lastExpense, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
            if (changePercent > 2) trend = "up";
            else if (changePercent < -2) trend = "down";
        } else if (thisExpense.compareTo(BigDecimal.ZERO) > 0) {
            trend = "up";
            changePercent = 100;
        }

        return new Insights(thisIncome, thisExpense, savings, lastExpense,
            Math.round(changePercent * 10.0) / 10.0, trend);
    }

    public ChartData chartData(User user) {
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yy");
        List<MonthlyData> monthlyTrend = new ArrayList<>();

        // Last 6 months
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = today.withDayOfMonth(1).minusMonths(i);
            LocalDate monthEnd = monthStart.plusMonths(1);
            String label = monthStart.format(fmt);
            BigDecimal inc = repo.sumByUserAndTypeAndDateBetween(user.getId(), TransactionType.INCOME, monthStart, monthEnd);
            BigDecimal exp = repo.sumByUserAndTypeAndDateBetween(user.getId(), TransactionType.EXPENSE, monthStart, monthEnd);
            monthlyTrend.add(new MonthlyData(label, inc, exp));
        }

        // Category breakdowns (all time)
        List<Object[]> expRows = repo.sumByCategory(user.getId(), TransactionType.EXPENSE);
        List<CategoryData> expCats = expRows.stream()
            .map(r -> new CategoryData((String) r[0], (BigDecimal) r[1])).toList();

        List<Object[]> incRows = repo.sumByCategory(user.getId(), TransactionType.INCOME);
        List<CategoryData> incCats = incRows.stream()
            .map(r -> new CategoryData((String) r[0], (BigDecimal) r[1])).toList();

        return new ChartData(monthlyTrend, expCats, incCats);
    }

    private Response toDto(Transaction t){
        return new Response(t.getId(), t.getType(), t.getCategory(), t.getAmount(), t.getNote(), t.getDate());
    }
}

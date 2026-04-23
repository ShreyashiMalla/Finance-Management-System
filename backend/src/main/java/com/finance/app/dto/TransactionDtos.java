package com.finance.app.dto;
import com.finance.app.entity.TransactionType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
public class TransactionDtos {
    public record CreateRequest(@NotNull TransactionType type, @NotBlank String category,
        @NotNull @DecimalMin("0.01") BigDecimal amount, String note, @NotNull LocalDate date) {}
    public record Response(Long id, TransactionType type, String category, BigDecimal amount, String note, LocalDate date) {}
    public record Summary(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal balance) {}
    public record Insights(
        BigDecimal thisMonthIncome,
        BigDecimal thisMonthExpense,
        BigDecimal thisMonthSavings,
        BigDecimal lastMonthExpense,
        double spendingChangePercent,
        String spendingTrend
    ) {}
    public record MonthlyData(String month, BigDecimal income, BigDecimal expense) {}
    public record CategoryData(String category, BigDecimal amount) {}
    public record ChartData(List<MonthlyData> monthlyTrend, List<CategoryData> expenseByCategory, List<CategoryData> incomeByCategory) {}
}

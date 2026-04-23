package com.finance.app.repository;
import com.finance.app.entity.Transaction;
import com.finance.app.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByDateDesc(Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :uid AND t.type = :type AND t.date >= :from AND t.date < :to")
    BigDecimal sumByUserAndTypeAndDateBetween(@Param("uid") Long uid, @Param("type") TransactionType type,
        @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :uid AND t.type = :type GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategory(@Param("uid") Long uid, @Param("type") TransactionType type);

    @Query("SELECT t.category, COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :uid AND t.type = :type AND t.date >= :from AND t.date < :to GROUP BY t.category ORDER BY SUM(t.amount) DESC")
    List<Object[]> sumByCategoryAndDateBetween(@Param("uid") Long uid, @Param("type") TransactionType type,
        @Param("from") LocalDate from, @Param("to") LocalDate to);
}

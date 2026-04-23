package com.finance.app.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity @Table(name="transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id", nullable=false) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private TransactionType type;
    @Column(nullable=false) private String category;
    @Column(nullable=false, precision=12, scale=2) private BigDecimal amount;
    private String note;
    @Column(nullable=false) private LocalDate date;
}

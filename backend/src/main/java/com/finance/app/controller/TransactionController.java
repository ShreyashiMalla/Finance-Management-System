package com.finance.app.controller;
import com.finance.app.dto.TransactionDtos.*;
import com.finance.app.entity.User;
import com.finance.app.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService svc;
    public TransactionController(TransactionService s){svc=s;}
    @GetMapping public List<Response> list(@AuthenticationPrincipal User u){return svc.list(u);}
    @PostMapping public Response create(@AuthenticationPrincipal User u, @Valid @RequestBody CreateRequest r){return svc.create(u,r);}
    @DeleteMapping("/{id}") public void delete(@AuthenticationPrincipal User u, @PathVariable Long id){svc.delete(u,id);}
    @GetMapping("/summary") public Summary summary(@AuthenticationPrincipal User u){return svc.summary(u);}
    @GetMapping("/insights") public Insights insights(@AuthenticationPrincipal User u){return svc.insights(u);}
    @GetMapping("/chart-data") public ChartData chartData(@AuthenticationPrincipal User u){return svc.chartData(u);}
}

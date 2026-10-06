package com.hotel.reservation.pattern.strategy;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.Payment;
import com.hotel.reservation.entity.Reservation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Context Class for Strategy Design Pattern.
 * Holds references to concrete PaymentStrategy implementations and delegates
 * execution dynamically at runtime based on the client's chosen payment method.
 */
@Component
public class PaymentStrategyContext {

    private final Map<String, PaymentStrategy> strategies = new ConcurrentHashMap<>();

    @Autowired
    public PaymentStrategyContext(List<PaymentStrategy> strategyList) {
        for (PaymentStrategy strategy : strategyList) {
            strategies.put(strategy.getMethod().toUpperCase(), strategy);
        }
    }

    /**
     * Executes the payment strategy matching the requested payment method.
     *
     * @param reservation The reservation being paid for.
     * @param request The payment request DTO containing payment details.
     * @param existingPayment Any pre-existing payment record, or null.
     * @return The resulting Payment entity initialized by the concrete strategy.
     */
    public Payment executeStrategy(Reservation reservation, PaymentRequest request, Payment existingPayment) {
        String method = (request.getPaymentMethod() != null && !request.getPaymentMethod().trim().isEmpty())
                ? request.getPaymentMethod().trim().toUpperCase()
                : "CREDIT_CARD";

        // Support DEBIT_CARD by delegating to CREDIT_CARD card gateway strategy
        if ("DEBIT_CARD".equals(method)) {
            method = "CREDIT_CARD";
        }

        PaymentStrategy strategy = strategies.get(method);

        // Fallback to CreditCard strategy if unknown method provided
        if (strategy == null) {
            strategy = strategies.getOrDefault("CREDIT_CARD", strategies.values().stream().findFirst().orElse(null));
        }

        if (strategy == null) {
            throw new IllegalArgumentException("No suitable payment strategy registered for method: " + method);
        }

        return strategy.execute(reservation, request, existingPayment);
    }
}

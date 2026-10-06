package com.hotel.reservation.pattern.strategy;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.Payment;
import com.hotel.reservation.entity.PaymentStatus;
import com.hotel.reservation.entity.Reservation;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Concrete Strategy for Credit and Debit Card Payment Processing.
 * Encapsulates card gateway handling, reference generation, and transaction confirmation.
 */
@Component
public class CreditCardPaymentStrategy implements PaymentStrategy {

    @Override
    public Payment execute(Reservation reservation, PaymentRequest request, Payment existingPayment) {
        String txnId = "CC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        if (existingPayment == null) {
            return new Payment(
                    reservation,
                    request.getAmount(),
                    "CREDIT_CARD",
                    PaymentStatus.SUCCESS,
                    txnId
            );
        } else {
            existingPayment.setAmount(request.getAmount());
            existingPayment.setPaymentMethod("CREDIT_CARD");
            existingPayment.setStatus(PaymentStatus.SUCCESS);
            existingPayment.setTransactionId(txnId);
            return existingPayment;
        }
    }

    @Override
    public String getMethod() {
        return "CREDIT_CARD";
    }
}

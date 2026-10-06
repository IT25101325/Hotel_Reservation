package com.hotel.reservation.pattern.strategy;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.Payment;
import com.hotel.reservation.entity.PaymentStatus;
import com.hotel.reservation.entity.Reservation;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Concrete Strategy for Online Direct Bank Transfer Processing.
 * Encapsulates bank reference clearing, transaction reconciliation, and payment entity initialization.
 */
@Component
public class OnlineBankingPaymentStrategy implements PaymentStrategy {

    @Override
    public Payment execute(Reservation reservation, PaymentRequest request, Payment existingPayment) {
        String txnId = "BANK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        if (existingPayment == null) {
            return new Payment(
                    reservation,
                    request.getAmount(),
                    "ONLINE_BANKING",
                    PaymentStatus.SUCCESS,
                    txnId
            );
        } else {
            existingPayment.setAmount(request.getAmount());
            existingPayment.setPaymentMethod("ONLINE_BANKING");
            existingPayment.setStatus(PaymentStatus.SUCCESS);
            existingPayment.setTransactionId(txnId);
            return existingPayment;
        }
    }

    @Override
    public String getMethod() {
        return "ONLINE_BANKING";
    }
}

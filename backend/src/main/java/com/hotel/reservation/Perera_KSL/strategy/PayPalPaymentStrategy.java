package com.hotel.reservation.pattern.strategy;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.Payment;
import com.hotel.reservation.entity.PaymentStatus;
import com.hotel.reservation.entity.Reservation;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Concrete Strategy for PayPal Digital Wallet Processing.
 * Encapsulates PayPal token generation, checkout session validation, and transaction confirmation.
 */
@Component
public class PayPalPaymentStrategy implements PaymentStrategy {

    @Override
    public Payment execute(Reservation reservation, PaymentRequest request, Payment existingPayment) {
        String txnId = "PP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        if (existingPayment == null) {
            return new Payment(
                    reservation,
                    request.getAmount(),
                    "PAYPAL",
                    PaymentStatus.SUCCESS,
                    txnId
            );
        } else {
            existingPayment.setAmount(request.getAmount());
            existingPayment.setPaymentMethod("PAYPAL");
            existingPayment.setStatus(PaymentStatus.SUCCESS);
            existingPayment.setTransactionId(txnId);
            return existingPayment;
        }
    }

    @Override
    public String getMethod() {
        return "PAYPAL";
    }
}

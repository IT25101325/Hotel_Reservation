package com.hotel.reservation.pattern.strategy;

import com.hotel.reservation.dto.PaymentRequest;
import com.hotel.reservation.entity.Payment;
import com.hotel.reservation.entity.Reservation;


 /**
 * Strategy Interface for Payment Processing (Behavioral Design Pattern).
 * Defines the common execution contract for different payment methods.
 */
public interface PaymentStrategy {


    Payment execute(Reservation reservation, PaymentRequest request, Payment existingPayment);

    /**
     * Returns the payment method identifier this strategy handles.
         */
    String getMethod();
}

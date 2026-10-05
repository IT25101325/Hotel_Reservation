-- =====================================================================================
-- SQL SERVER SETUP SCRIPT (FOR SQL SERVER MANAGEMENT STUDIO 22 / SSMS)
-- Database: hotel_reservation_db
-- Web-Based Hotel Reservation System for Special Events
-- Contains:
--   1. Database Creation & Context Selection
--   2. Clean Reset of Constraints & Tables
--   3. All Application Database Tables (Users, Customers, Employees, Venue/Rooms,
--      Packages, Reservations, Invoices, Payments, Guests, Staff Schedules,
--      Resource Allocations, Leave Requests, Complaints, Announcements, Logs, Notifications)
--   4. User Account Connection for ALL 6 Roles including:
--      - HR & Resource Manager (hrmgr -> David Miller)
--      - Venue & Facility Manager (venuemgr -> Elena Vance)
--      - Event Coordinator (eventmgr -> Robert Brown)
--      - Reservation Supervisor (supervisor -> Alice Smith)
--      - Administrator (admin)
--      - Customers (customer1, customer2)
--   5. Exactly 5 Sample Datasets Inserted Into Each Table
-- =====================================================================================

-- 1. Create Database if it does not already exist
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'hotel_reservation_db')
BEGIN
    CREATE DATABASE [hotel_reservation_db];
END
GO

USE [hotel_reservation_db];
GO

-- 2. Drop all foreign keys dynamically to guarantee clean, error-free recreation
DECLARE @drop_fks NVARCHAR(MAX) = N'';
SELECT @drop_fks += N'ALTER TABLE ' + QUOTENAME(s.name) + N'.' + QUOTENAME(t.name) + 
                   N' DROP CONSTRAINT ' + QUOTENAME(fk.name) + N';' + CHAR(13)
FROM sys.foreign_keys fk
JOIN sys.tables t ON fk.parent_object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id;
IF LEN(@drop_fks) > 0 EXEC sp_executesql @drop_fks;
GO

-- 3. Clean Drop existing tables in reverse dependency order
IF OBJECT_ID(N'dbo.notifications', N'U') IS NOT NULL DROP TABLE dbo.notifications;
IF OBJECT_ID(N'dbo.activity_logs', N'U') IS NOT NULL DROP TABLE dbo.activity_logs;
IF OBJECT_ID(N'dbo.announcements', N'U') IS NOT NULL DROP TABLE dbo.announcements;
IF OBJECT_ID(N'dbo.complaints_feedback', N'U') IS NOT NULL DROP TABLE dbo.complaints_feedback;
IF OBJECT_ID(N'dbo.resource_allocations', N'U') IS NOT NULL DROP TABLE dbo.resource_allocations;
IF OBJECT_ID(N'dbo.staff_schedules', N'U') IS NOT NULL DROP TABLE dbo.staff_schedules;
IF OBJECT_ID(N'dbo.leave_requests', N'U') IS NOT NULL DROP TABLE dbo.leave_requests;
IF OBJECT_ID(N'dbo.guests', N'U') IS NOT NULL DROP TABLE dbo.guests;
IF OBJECT_ID(N'dbo.payments', N'U') IS NOT NULL DROP TABLE dbo.payments;
IF OBJECT_ID(N'dbo.invoices', N'U') IS NOT NULL DROP TABLE dbo.invoices;
IF OBJECT_ID(N'dbo.reservations', N'U') IS NOT NULL DROP TABLE dbo.reservations;
IF OBJECT_ID(N'dbo.event_schedules', N'U') IS NOT NULL DROP TABLE dbo.event_schedules;
IF OBJECT_ID(N'dbo.promotions', N'U') IS NOT NULL DROP TABLE dbo.promotions;
IF OBJECT_ID(N'dbo.package_services', N'U') IS NOT NULL DROP TABLE dbo.package_services;
IF OBJECT_ID(N'dbo.event_packages', N'U') IS NOT NULL DROP TABLE dbo.event_packages;
IF OBJECT_ID(N'dbo.facilities', N'U') IS NOT NULL DROP TABLE dbo.facilities;
IF OBJECT_ID(N'dbo.room_categories', N'U') IS NOT NULL DROP TABLE dbo.room_categories;
IF OBJECT_ID(N'dbo.venue_rooms', N'U') IS NOT NULL DROP TABLE dbo.venue_rooms;
IF OBJECT_ID(N'dbo.employees', N'U') IS NOT NULL DROP TABLE dbo.employees;
IF OBJECT_ID(N'dbo.customers', N'U') IS NOT NULL DROP TABLE dbo.customers;
IF OBJECT_ID(N'dbo.users', N'U') IS NOT NULL DROP TABLE dbo.users;
GO

-- =====================================================================================
-- TABLE CREATION SECTION
-- =====================================================================================

-- Table 1: Users
CREATE TABLE dbo.users (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    role NVARCHAR(50) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    active BIT DEFAULT 1
);
GO

-- Table 2: Customers
CREATE TABLE dbo.customers (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    address NVARCHAR(255),
    passport_or_nic NVARCHAR(50),
    emergency_contact NVARCHAR(50),
    special_preferences NVARCHAR(MAX),
    loyalty_points INT DEFAULT 0,
    CONSTRAINT FK_customers_users FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- Table 3: Employees (Connected to users table for Admin, Supervisor, Event Mgr, Venue Mgr, HR Mgr)
CREATE TABLE dbo.employees (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NULL,
    employee_code NVARCHAR(20) NOT NULL UNIQUE,
    full_name NVARCHAR(100) NOT NULL,
    department NVARCHAR(50) NOT NULL,
    designation NVARCHAR(50) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    phone NVARCHAR(20),
    hire_date DATE,
    active BIT DEFAULT 1,
    CONSTRAINT FK_employees_users FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE SET NULL
);
GO
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO
CREATE UNIQUE NONCLUSTERED INDEX UQ_employees_user_id ON dbo.employees(user_id) WHERE user_id IS NOT NULL;
GO

-- Table 4: Venue & Rooms
CREATE TABLE dbo.venue_rooms (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    facilities NVARCHAR(MAX),
    description NVARCHAR(MAX),
    image_url NVARCHAR(500),
    available BIT DEFAULT 1
);
GO

-- Table 5: Event Packages
CREATE TABLE dbo.event_packages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    event_type NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10, 2) NOT NULL,
    max_capacity INT NOT NULL,
    is_published BIT DEFAULT 0,
    discount_percentage FLOAT DEFAULT 0.0,
    image_url NVARCHAR(500)
);
GO

-- Table 6: Package Services
CREATE TABLE dbo.package_services (
    package_id BIGINT NOT NULL,
    service_name NVARCHAR(255) NOT NULL,
    CONSTRAINT FK_package_services_package FOREIGN KEY (package_id) REFERENCES dbo.event_packages(id) ON DELETE CASCADE
);
GO

-- Table 7: Reservations
CREATE TABLE dbo.reservations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    venue_room_id BIGINT NOT NULL,
    event_package_id BIGINT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    guest_count INT NOT NULL,
    special_notes NVARCHAR(MAX),
    total_amount DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_reservations_customer FOREIGN KEY (customer_id) REFERENCES dbo.customers(id),
    CONSTRAINT FK_reservations_venue FOREIGN KEY (venue_room_id) REFERENCES dbo.venue_rooms(id),
    CONSTRAINT FK_reservations_package FOREIGN KEY (event_package_id) REFERENCES dbo.event_packages(id)
);
GO

-- Table 8: Invoices
CREATE TABLE dbo.invoices (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    invoice_number NVARCHAR(50) NOT NULL UNIQUE,
    reservation_id BIGINT UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_total DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'ISSUED',
    issue_date DATE DEFAULT GETDATE(),
    due_date DATE,
    billing_address NVARCHAR(255),
    CONSTRAINT FK_invoices_reservation FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(id) ON DELETE CASCADE
);
GO

-- Table 9: Payments
CREATE TABLE dbo.payments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    reservation_id BIGINT UNIQUE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    transaction_id NVARCHAR(100),
    failure_reason NVARCHAR(255),
    payment_date DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_payments_reservation FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(id) ON DELETE CASCADE
);
GO

-- Table 10: Guests
CREATE TABLE dbo.guests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100),
    phone NVARCHAR(20),
    nic_or_passport NVARCHAR(50),
    relationship NVARCHAR(50),
    special_needs NVARCHAR(MAX),
    age_group NVARCHAR(50),
    CONSTRAINT FK_guests_customer FOREIGN KEY (customer_id) REFERENCES dbo.customers(id) ON DELETE CASCADE
);
GO

-- Table 11: Leave Requests
CREATE TABLE dbo.leave_requests (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason NVARCHAR(255) NOT NULL,
    status NVARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT FK_leave_requests_employee FOREIGN KEY (employee_id) REFERENCES dbo.employees(id) ON DELETE CASCADE
);
GO

-- Table 12: Staff Schedules
CREATE TABLE dbo.staff_schedules (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    shift_type NVARCHAR(50) NOT NULL,
    shift_date DATE NOT NULL,
    start_time NVARCHAR(20),
    end_time NVARCHAR(20),
    notes NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'ASSIGNED',
    CONSTRAINT FK_staff_schedules_employee FOREIGN KEY (employee_id) REFERENCES dbo.employees(id) ON DELETE CASCADE
);
GO

-- Table 13: Resource Allocations
CREATE TABLE dbo.resource_allocations (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    employee_id BIGINT,
    resource_name NVARCHAR(100),
    role_assigned NVARCHAR(100),
    allocation_date DATE NOT NULL,
    CONSTRAINT FK_allocations_reservation FOREIGN KEY (reservation_id) REFERENCES dbo.reservations(id) ON DELETE CASCADE,
    CONSTRAINT FK_allocations_employee FOREIGN KEY (employee_id) REFERENCES dbo.employees(id) ON DELETE SET NULL
);
GO

-- Table 14: Complaints & Feedback
CREATE TABLE dbo.complaints_feedback (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type NVARCHAR(50) NOT NULL,
    subject NVARCHAR(150) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    rating INT,
    status NVARCHAR(50) DEFAULT 'OPEN',
    admin_response NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_complaints_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- Table 15: Announcements
CREATE TABLE dbo.announcements (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(150) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    target_audience NVARCHAR(50) DEFAULT 'ALL',
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Table 16: Activity Logs
CREATE TABLE dbo.activity_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50),
    action NVARCHAR(100),
    details NVARCHAR(MAX),
    timestamp DATETIME2 DEFAULT GETDATE()
);
GO

-- Table 17: Notifications
CREATE TABLE dbo.notifications (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title NVARCHAR(150) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_notifications_user FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- Table 18: Room Categories (Optional Supplementary System Table)
CREATE TABLE dbo.room_categories (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    code NVARCHAR(50) NOT NULL,
    description NVARCHAR(MAX),
    base_price_multiplier NUMERIC(38, 2) DEFAULT 1.00,
    active BIT DEFAULT 1
);
GO

-- Table 19: Facilities (Optional Supplementary System Table)
CREATE TABLE dbo.facilities (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    category NVARCHAR(50) NOT NULL,
    icon_name NVARCHAR(50)
);
GO

-- Table 20: Promotions (Optional Supplementary System Table)
CREATE TABLE dbo.promotions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(150) NOT NULL,
    promo_code NVARCHAR(50) NOT NULL UNIQUE,
    discount_percent FLOAT NOT NULL,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    applicable_event_type NVARCHAR(50),
    active BIT DEFAULT 1
);
GO

-- Table 21: Event Schedules (Optional Supplementary System Table)
CREATE TABLE dbo.event_schedules (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(150) NOT NULL,
    event_package_id BIGINT,
    venue_room_id BIGINT,
    schedule_date DATE NOT NULL,
    start_time NVARCHAR(20),
    end_time NVARCHAR(20),
    coordinator_name NVARCHAR(100),
    status NVARCHAR(50) DEFAULT 'SCHEDULED',
    notes NVARCHAR(MAX),
    CONSTRAINT FK_event_schedules_package FOREIGN KEY (event_package_id) REFERENCES dbo.event_packages(id) ON DELETE SET NULL,
    CONSTRAINT FK_event_schedules_venue FOREIGN KEY (venue_room_id) REFERENCES dbo.venue_rooms(id) ON DELETE SET NULL
);
GO

-- =====================================================================================
-- DATA INSERTION SECTION (5+ DATA SETS PER TABLE)
-- Note: Default password for all user accounts is "password123" (BCrypt encoded)
-- =====================================================================================

-- 1. Insert Users (Includes Venue Manager Elena Vance and HR Manager David Miller)
SET IDENTITY_INSERT dbo.users ON;
INSERT INTO dbo.users (id, username, email, password, full_name, phone, role, created_at, active) VALUES
(1, 'admin', 'admin@hotel.com', '$2a$10$xfVfhpeaApCkObFR/HjCpu1b/zX2wVA6EpkGFAz6K4MT4QHU7kcfq', 'General Manager Admin', '+94771234560', 'ROLE_ADMIN', '2026-09-01 08:00:00', 1),
(2, 'customer1', 'john.doe@gmail.com', '$2a$10$xfVfhpeaApCkObFR/HjCpu1b/zX2wVA6EpkGFAz6K4MT4QHU7kcfq', 'John Doe', '+94771234561', 'ROLE_CUSTOMER', '2026-09-05 09:30:00', 1),
(3, 'customer2', 'jane.smith@gmail.com', '$2a$10$xfVfhpeaApCkObFR/HjCpu1b/zX2wVA6EpkGFAz6K4MT4QHU7kcfq', 'Jane Smith', '+94771234562', 'ROLE_CUSTOMER', '2026-09-10 11:15:00', 1),
(4, 'supervisor', 'supervisor@hotel.com', '$2a$10$xfVfhpeaApCkObFR/HjCpu1b/zX2wVA6EpkGFAz6K4MT4QHU7kcfq', 'Alice Smith', '+94771234563', 'ROLE_RESERVATION_SUPERVISOR', '2026-09-01 08:30:00', 1),
(5, 'eventmgr', 'events@hotel.com', '$2a$10$xfVfhpeaApCkObFR/HjCpu1b/zX2wVA6EpkGFAz6K4MT4QHU7kcfq', 'Robert Brown', '+94771234564', 'ROLE_EVENT_COORDINATOR', '2026-09-02 09:00:00', 1),
(6, 'venuemgr', 'venues@hotel.com', '$2a$10$xfVfhpeaApCkObFR/HjCpu1b/zX2wVA6EpkGFAz6K4MT4QHU7kcfq', 'Elena Vance', '+94771234565', 'ROLE_VENUE_MANAGER', '2026-09-02 09:30:00', 1),
(7, 'hrmgr', 'hr@hotel.com', '$2a$10$xfVfhpeaApCkObFR/HjCpu1b/zX2wVA6EpkGFAz6K4MT4QHU7kcfq', 'David Miller', '+94771234566', 'ROLE_HR_MANAGER', '2026-09-02 10:00:00', 1);
SET IDENTITY_INSERT dbo.users OFF;
GO

-- 2. Insert Customers (5 Rows)
SET IDENTITY_INSERT dbo.customers ON;
INSERT INTO dbo.customers (id, user_id, address, passport_or_nic, emergency_contact, special_preferences, loyalty_points) VALUES
(1, 1, 'Suite 10, Colombo City Center', 'NIC850011223V', '+94771234560', 'VIP executive handling, airport shuttle', 500),
(2, 2, '123 Palm Grove Ave, Colombo 03', '981234567V', '+94711111111', 'High-floor room preferred, vegetarian catering', 150),
(3, 3, '45 Lake Drive, Kandy', 'N923456781', '+94772223344', 'Ocean view, non-smoking, early check-in', 220),
(4, 4, '88 Galle Face Terrace, Colombo', 'NIC783456129V', '+94773334455', 'Corporate billing, quiet floor', 350),
(5, 5, '12 Temple Road, Negombo', 'NIC904561238V', '+94774445566', 'Family suite setup, crib required', 80);
SET IDENTITY_INSERT dbo.customers OFF;
GO

-- 3. Insert Employees (5 Rows: Connected to User Accounts for Admin, Supervisor, Event Mgr, Venue Mgr, HR Mgr)
SET IDENTITY_INSERT dbo.employees ON;
INSERT INTO dbo.employees (id, user_id, employee_code, full_name, department, designation, salary, phone, hire_date, active) VALUES
(1, 1, 'EMP-001', 'General Manager Admin', 'Executive Admin', 'General Manager', 180000.00, '+94771234560', '2023-01-15', 1),
(2, 4, 'EMP-002', 'Alice Smith', 'Reservation & Front Office', 'Reservation Supervisor', 95000.00, '+94771234563', '2023-06-01', 1),
(3, 5, 'EMP-003', 'Robert Brown', 'Event Coordination', 'Event Manager', 110000.00, '+94771234564', '2023-08-15', 1),
(4, 6, 'EMP-004', 'Elena Vance', 'Venue Operations', 'Venue & Facilities Manager', 105000.00, '+94771234565', '2024-02-01', 1),
(5, 7, 'EMP-005', 'David Miller', 'Human Resources', 'HR & Resource Manager', 115000.00, '+94771234566', '2022-11-10', 1);
SET IDENTITY_INSERT dbo.employees OFF;
GO

-- 4. Insert Venue & Rooms (5 Rows)
SET IDENTITY_INSERT dbo.venue_rooms ON;
INSERT INTO dbo.venue_rooms (id, name, type, category, capacity, price_per_night, facilities, description, image_url, available) VALUES
(1, 'The Grand Royal Ballroom', 'BANQUET_HALL', 'GRAND_BALLROOM', 500, 2500.00, 'Central AC, High-tech Audio/Visual, Stage, LED Screen, Catering Kitchen Access', 'Luxury banquet hall ideal for grand weddings, gala dinners, and international conferences.', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80', 1),
(2, 'Emerald Oceanfront Garden', 'GARDEN_VENUE', 'GARDEN', 300, 1800.00, 'Outdoor Lighting, Gazebo, Beach Access, Portable Stage, Sunset View', 'Breathtaking outdoor oceanfront garden venue surrounded by tropical palms for romantic outdoor weddings.', 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80', 1),
(3, 'Executive Pinnacle Suite', 'ROOM', 'SUITE', 4, 450.00, 'King Size Bed, Jacuzzi, Private Balcony, High-speed Wi-Fi, Mini Bar', 'Exclusive luxury suite offering panoramic views, living area, and premium amenities.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', 1),
(4, 'Sapphire Conference Center', 'CONFERENCE_HALL', 'EXECUTIVE', 120, 950.00, 'Smart Projector, Hybrid Video Conferencing System, Soundproof Walls, Ergonomic Chairs', 'State-of-the-art conference center tailored for corporate seminars, workshops, and business summits.', 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=1200&q=80', 1),
(5, 'Deluxe Ocean View Room', 'ROOM', 'DELUXE', 2, 220.00, 'Queen Bed, Sea View Balcony, Work Desk, Smart TV, Air Conditioning', 'Comfortable deluxe room with stunning ocean vistas.', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80', 1);
SET IDENTITY_INSERT dbo.venue_rooms OFF;
GO

-- 5. Insert Event Packages (5 Rows)
SET IDENTITY_INSERT dbo.event_packages ON;
INSERT INTO dbo.event_packages (id, name, event_type, description, price, max_capacity, is_published, discount_percentage, image_url) VALUES
(1, 'Royal Wedding Extravaganza', 'WEDDING', 'Complete luxury wedding package with floral decor, 5-course banquet meal, welcome drinks, and bridal suite stay.', 4500.00, 350, 1, 10.0, 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'),
(2, 'Corporate Leadership Summit', 'CONFERENCE', 'All-inclusive professional package with technical setup, continuous coffee breaks, and executive lunch.', 2200.00, 100, 1, 5.0, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80'),
(3, 'VIP Birthday Jubilee', 'BIRTHDAY', 'Vibrant celebration package featuring themed decor, photo booth, cocktail bar, and custom birthday cake.', 1500.00, 80, 1, 0.0, 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80'),
(4, 'Gala Dinner Celebration', 'BANQUET', 'Exclusive formal banquet package with gourmet dining, live acoustic performance, and champagne toast.', 3200.00, 200, 1, 8.0, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'),
(5, 'Silver Anniversary Romantic Retreat', 'ANNIVERSARY', 'Intimate anniversary dinner by the ocean with customized floral pavilion, violinist, and candlelight setup.', 1800.00, 50, 1, 12.0, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80');
SET IDENTITY_INSERT dbo.event_packages OFF;
GO

-- 6. Insert Package Services (5 Rows)
INSERT INTO dbo.package_services (package_id, service_name) VALUES
(1, '5-Course Gourmet Buffet & 3-Tier Wedding Cake'),
(2, 'High-speed Wi-Fi, AV System & Delegate Kits'),
(3, 'Themed Lighting, 360 Photo Booth & Cocktail Bar'),
(4, 'Red Carpet Entrance, Acoustic Band & Gala Dinner'),
(5, 'Sunset Beach Gazebo, Violinist & Candlelight Dinner');
GO

-- 7. Insert Reservations (5 Rows)
SET IDENTITY_INSERT dbo.reservations ON;
INSERT INTO dbo.reservations (id, customer_id, venue_room_id, event_package_id, start_date, end_date, guest_count, special_notes, total_amount, status, created_at) VALUES
(1, 2, 1, 1, '2026-10-15', '2026-10-16', 250, 'Vegetarian buffet options and bride dressing room access required', 4050.00, 'CONFIRMED', '2026-09-15 10:00:00'),
(2, 3, 4, 2, '2026-11-05', '2026-11-06', 80, 'Podium setup and wireless roving microphones needed', 2090.00, 'CONFIRMED', '2026-09-16 11:30:00'),
(3, 2, 2, 3, '2026-11-20', '2026-11-21', 60, 'LED dance floor and birthday cake stand requested', 1500.00, 'PENDING', '2026-09-18 14:15:00'),
(4, 4, 3, NULL, '2026-12-01', '2026-12-04', 2, 'VIP airport pickup requested at 2 PM', 1350.00, 'CONFIRMED', '2026-09-19 16:45:00'),
(5, 5, 1, 4, '2026-12-15', '2026-12-16', 150, 'Red carpet entrance and security coordination', 2944.00, 'CONFIRMED', '2026-09-20 09:10:00');
SET IDENTITY_INSERT dbo.reservations OFF;
GO

-- 8. Insert Invoices (5 Rows)
SET IDENTITY_INSERT dbo.invoices ON;
INSERT INTO dbo.invoices (id, invoice_number, reservation_id, amount, tax_amount, discount_amount, net_total, status, issue_date, due_date, billing_address) VALUES
(1, 'INV-2026-001', 1, 4500.00, 450.00, 900.00, 4050.00, 'PAID', '2026-09-15', '2026-10-10', '123 Palm Grove Ave, Colombo 03'),
(2, 'INV-2026-002', 2, 2200.00, 220.00, 330.00, 2090.00, 'PAID', '2026-09-16', '2026-11-01', '45 Lake Drive, Kandy'),
(3, 'INV-2026-003', 3, 1500.00, 150.00, 150.00, 1500.00, 'ISSUED', '2026-09-18', '2026-11-15', '123 Palm Grove Ave, Colombo 03'),
(4, 'INV-2026-004', 4, 1350.00, 135.00, 135.00, 1350.00, 'PAID', '2026-09-19', '2026-11-25', '88 Galle Face Terrace, Colombo'),
(5, 'INV-2026-005', 5, 3200.00, 320.00, 576.00, 2944.00, 'PAID', '2026-09-20', '2026-12-10', '12 Temple Road, Negombo');
SET IDENTITY_INSERT dbo.invoices OFF;
GO

-- 9. Insert Payments (5 Rows)
SET IDENTITY_INSERT dbo.payments ON;
INSERT INTO dbo.payments (id, reservation_id, amount, payment_method, status, transaction_id, failure_reason, payment_date) VALUES
(1, 1, 4050.00, 'CREDIT_CARD', 'COMPLETED', 'TXN-98124801', NULL, '2026-09-15 10:30:00'),
(2, 2, 2090.00, 'BANK_TRANSFER', 'COMPLETED', 'TXN-98124802', NULL, '2026-09-16 12:00:00'),
(3, 3, 1500.00, 'ONLINE_PORTAL', 'PENDING', 'TXN-98124803', NULL, '2026-09-18 14:20:00'),
(4, 4, 1350.00, 'CREDIT_CARD', 'COMPLETED', 'TXN-98124804', NULL, '2026-09-19 17:00:00'),
(5, 5, 2944.00, 'CREDIT_CARD', 'COMPLETED', 'TXN-98124805', NULL, '2026-09-20 09:30:00');
SET IDENTITY_INSERT dbo.payments OFF;
GO

-- 10. Insert Guests (5 Rows)
SET IDENTITY_INSERT dbo.guests ON;
INSERT INTO dbo.guests (id, customer_id, full_name, email, phone, nic_or_passport, relationship, special_needs, age_group) VALUES
(1, 2, 'Jane Doe', 'jane.doe@gmail.com', '+94771234568', '991234567V', 'Spouse', 'Vegetarian menu preferred', 'ADULT'),
(2, 2, 'Michael Doe', 'michael.doe@gmail.com', '+94771234569', '011234567V', 'Child', 'High chair required at dining', 'CHILD'),
(3, 3, 'David Smith', 'david.smith@gmail.com', '+94772223399', '881234567V', 'Spouse', 'Wheelchair accessibility needed', 'ADULT'),
(4, 3, 'Emma Smith', 'emma.smith@gmail.com', '+94772223388', '051234567V', 'Daughter', 'Severe nut allergy precautions', 'TEEN'),
(5, 4, 'Sarah Perera', 'sarah.p@gmail.com', '+94773334499', '941234567V', 'Colleague', 'Late check-in coordination required', 'ADULT');
SET IDENTITY_INSERT dbo.guests OFF;
GO

-- 11. Insert Leave Requests (5 Rows)
SET IDENTITY_INSERT dbo.leave_requests ON;
INSERT INTO dbo.leave_requests (id, employee_id, start_date, end_date, reason, status) VALUES
(1, 1, '2026-10-01', '2026-10-03', 'Annual executive leave for overseas hospitality conference', 'APPROVED'),
(2, 2, '2026-10-10', '2026-10-12', 'Medical appointment and family commitment', 'APPROVED'),
(3, 3, '2026-11-01', '2026-11-02', 'Attending event management workshop in Kandy', 'PENDING'),
(4, 4, '2026-11-15', '2026-11-18', 'Personal leave for family wedding celebration', 'PENDING'),
(5, 5, '2026-12-05', '2026-12-08', 'Year-end casual leave entitlement', 'REJECTED');
SET IDENTITY_INSERT dbo.leave_requests OFF;
GO

-- 12. Insert Staff Schedules (5 Rows)
SET IDENTITY_INSERT dbo.staff_schedules ON;
INSERT INTO dbo.staff_schedules (id, employee_id, shift_type, shift_date, start_time, end_time, notes, status) VALUES
(1, 1, 'MORNING', '2026-10-01', '08:00', '16:00', 'Executive operations oversight and department reviews', 'ASSIGNED'),
(2, 2, 'MORNING', '2026-10-01', '08:00', '16:00', 'Front desk customer check-ins and booking approvals duty', 'ASSIGNED'),
(3, 3, 'EVENT_DUTY', '2026-10-15', '09:00', '21:00', 'Overseeing Grand Ballroom setup and royal wedding rehearsal', 'ASSIGNED'),
(4, 4, 'EVENING', '2026-10-02', '14:00', '22:00', 'Venue and facilities inspection, sound/lighting testing', 'ASSIGNED'),
(5, 5, 'MORNING', '2026-10-03', '08:30', '16:30', 'Staff duty roster management and employee leave processing', 'ASSIGNED');
SET IDENTITY_INSERT dbo.staff_schedules OFF;
GO

-- 13. Insert Resource Allocations (5 Rows)
SET IDENTITY_INSERT dbo.resource_allocations ON;
INSERT INTO dbo.resource_allocations (id, reservation_id, employee_id, resource_name, role_assigned, allocation_date) VALUES
(1, 1, 3, 'Grand Ballroom Sound & Lighting System', 'Lead Event Coordinator', '2026-10-15'),
(2, 2, 2, 'Sapphire Conference Smart AV Pod', 'Technical Support Supervisor', '2026-11-05'),
(3, 3, 4, 'Garden Illuminations & Gazebo Setup', 'Venue Operations Supervisor', '2026-11-20'),
(4, 4, 2, 'Pinnacle Suite VIP Welcoming Kit', 'Front Office Concierge', '2026-12-01'),
(5, 5, 5, 'Banquet Security & Crowd Barrier Logistics', 'Logistics and Staff Dispatcher', '2026-12-15');
SET IDENTITY_INSERT dbo.resource_allocations OFF;
GO

-- 14. Insert Complaints & Feedback (5 Rows)
SET IDENTITY_INSERT dbo.complaints_feedback ON;
INSERT INTO dbo.complaints_feedback (id, user_id, type, subject, message, rating, status, admin_response, created_at) VALUES
(1, 2, 'FEEDBACK', 'Outstanding wedding hall arrangement', 'The Grand Royal Ballroom exceeded all our expectations! The lighting and audio were top notch.', 5, 'CLOSED', 'Thank you for your generous feedback Mr. John! It was our absolute pleasure to host your event.', '2026-09-17 14:00:00'),
(2, 3, 'COMPLAINT', 'Conference Wi-Fi latency in Room 2', 'During the afternoon summit, Wi-Fi speeds slowed down for conference delegates.', 3, 'RESOLVED', 'We have upgraded the dedicated access point firmware to eliminate throttling.', '2026-09-18 16:30:00'),
(3, 4, 'FEEDBACK', 'Pinnacle suite was immaculate', 'Wonderful ocean views and polite concierge staff. Will definitely visit again.', 5, 'CLOSED', 'Delighted to hear this! We look forward to welcoming you back.', '2026-09-20 18:00:00'),
(4, 5, 'COMPLAINT', 'Delayed invoice receipt', 'It took two days after payment to receive our official PDF tax invoice.', 2, 'OPEN', 'Our finance team is currently investigating this delay and will issue the receipt immediately.', '2026-09-21 09:45:00'),
(5, 2, 'SUGGESTION', 'Add more vegan options to gala menu', 'It would be great to have a wider selection of plant-based appetizers for banquet packages.', 4, 'IN_REVIEW', 'Passed directly to our Executive Chef for the upcoming seasonal menu revision.', '2026-09-22 11:20:00');
SET IDENTITY_INSERT dbo.complaints_feedback OFF;
GO

-- 15. Insert Announcements (5 Rows)
SET IDENTITY_INSERT dbo.announcements ON;
INSERT INTO dbo.announcements (id, title, content, target_audience, created_at) VALUES
(1, 'Welcome to the Grand Horizon Hotel Portal!', 'We are thrilled to launch our new online reservation portal for room and venue bookings.', 'ALL', '2026-09-01 09:00:00'),
(2, 'Mandatory Staff Training Workshop', 'HR has scheduled an advanced customer service training session on Monday at 10:00 AM in Conference Hall 1.', 'STAFF', '2026-09-03 14:00:00'),
(3, 'Early Bird Holiday Season Packages Available', 'Book your year-end corporate galas and wedding receptions before October 31 to enjoy up to 15% discount.', 'CUSTOMERS', '2026-09-10 10:30:00'),
(4, 'Scheduled Server Maintenance Notice', 'The system will undergo routine database backup and maintenance this Sunday from 02:00 AM to 03:00 AM.', 'ALL', '2026-09-15 08:00:00'),
(5, 'Ballroom Audio-Visual Upgrade Complete', 'The Grand Ballroom is now equipped with state-of-the-art 4K LED video walls and wireless audio systems.', 'STAFF', '2026-09-20 12:00:00');
SET IDENTITY_INSERT dbo.announcements OFF;
GO

-- 16. Insert Activity Logs (5 Rows)
SET IDENTITY_INSERT dbo.activity_logs ON;
INSERT INTO dbo.activity_logs (id, username, action, details, timestamp) VALUES
(1, 'admin', 'SYSTEM_INITIALIZATION', 'Initialized database schema and verified default system roles and accounts.', '2026-09-01 08:05:00'),
(2, 'customer1', 'USER_LOGIN', 'Customer John Doe logged into the reservation portal from IP 192.168.1.45.', '2026-09-15 09:50:00'),
(3, 'customer1', 'RESERVATION_CREATED', 'Created reservation #1 for The Grand Royal Ballroom with package #1.', '2026-09-15 10:00:00'),
(4, 'supervisor', 'RESERVATION_APPROVED', 'Supervisor Alice Smith approved reservation #1 and verified payment status.', '2026-09-15 10:35:00'),
(5, 'eventmgr', 'RESOURCE_ALLOCATION', 'Allocated audio/visual technician and lead coordinator to reservation #1.', '2026-09-15 11:00:00');
SET IDENTITY_INSERT dbo.activity_logs OFF;
GO

-- 17. Insert Notifications (5 Rows)
SET IDENTITY_INSERT dbo.notifications ON;
INSERT INTO dbo.notifications (id, user_id, title, message, is_read, created_at) VALUES
(1, 2, 'Reservation Confirmed', 'Your reservation #1 for The Grand Royal Ballroom has been officially approved.', 1, '2026-09-15 10:36:00'),
(2, 2, 'Payment Receipt Available', 'Payment of $4,050.00 for reservation #1 was received successfully.', 1, '2026-09-15 10:37:00'),
(3, 3, 'Corporate Summit Booking Received', 'Your booking request #2 for Sapphire Conference Center is confirmed.', 0, '2026-09-16 11:35:00'),
(4, 4, 'Welcome to Loyalty Rewards', 'Congratulations! You have earned 350 loyalty points on your recent suite booking.', 0, '2026-09-19 16:50:00'),
(5, 1, 'New Customer Feedback Submitted', 'Customer John Doe submitted a 5-star review regarding The Grand Royal Ballroom.', 0, '2026-09-17 14:05:00');
SET IDENTITY_INSERT dbo.notifications OFF;
GO

-- 18. Insert Room Categories (5 Rows)
SET IDENTITY_INSERT dbo.room_categories ON;
INSERT INTO dbo.room_categories (id, name, code, description, base_price_multiplier, active) VALUES
(1, 'Grand Banquet Ballroom', 'BALLROOM', 'High-capacity luxury event ballrooms with stage access', 1.50, 1),
(2, 'Executive Conference Hall', 'EXECUTIVE', 'Modern conference halls with integrated audio-visual technology', 1.20, 1),
(3, 'Oceanfront Garden', 'GARDEN', 'Scenic outdoor garden landscapes for romantic celebrations', 1.30, 1),
(4, 'Deluxe Guest Room', 'DELUXE', 'Standard luxury deluxe guest accommodation with sea views', 1.00, 1),
(5, 'Pinnacle Luxury Suite', 'SUITE', 'VIP luxury executive suites with private jacuzzi and lounge', 1.80, 1);
SET IDENTITY_INSERT dbo.room_categories OFF;
GO

-- 19. Insert Facilities (5 Rows)
SET IDENTITY_INSERT dbo.facilities ON;
INSERT INTO dbo.facilities (id, name, description, category, icon_name) VALUES
(1, 'Central Air Conditioning', 'Climate controlled environment for all venues', 'COMFORT', 'Wind'),
(2, 'High-Tech Audio & Visual', 'Smart 4K projectors and surround acoustic sound systems', 'AUDIO_VISUAL', 'Tv'),
(3, 'Gourmet Catering Kitchen', 'Full commercial kitchen access for banquet preparation', 'CATERING', 'Utensils'),
(4, 'High-Speed Fiber Wi-Fi', 'Dedicated gigabit wireless for attendees and corporate conferences', 'CONNECTIVITY', 'Wifi'),
(5, 'Beach & Gazebo Access', 'Direct oceanfront pathway with illuminated gazebo', 'OUTDOOR', 'Sun');
SET IDENTITY_INSERT dbo.facilities OFF;
GO

-- 20. Insert Promotions (5 Rows)
SET IDENTITY_INSERT dbo.promotions ON;
INSERT INTO dbo.promotions (id, title, promo_code, discount_percent, valid_from, valid_to, applicable_event_type, active) VALUES
(1, 'Grand Summer Celebration', 'SUMMER20', 20.0, '2026-09-01', '2026-11-30', 'WEDDING', 1),
(2, 'Corporate Early Bird', 'CORP15', 15.0, '2026-09-01', '2026-12-15', 'CONFERENCE', 1),
(3, 'VIP Birthday Jubilee', 'BDAY10', 10.0, '2026-09-01', '2026-10-31', 'BIRTHDAY', 1),
(4, 'Gala Banquet Special', 'GALA12', 12.0, '2026-10-01', '2026-12-31', 'BANQUET', 1),
(5, 'Silver Anniversary Discount', 'ANNIV25', 25.0, '2026-09-15', '2026-11-15', 'ANNIVERSARY', 1);
SET IDENTITY_INSERT dbo.promotions OFF;
GO

-- 21. Insert Event Schedules (5 Rows)
SET IDENTITY_INSERT dbo.event_schedules ON;
INSERT INTO dbo.event_schedules (id, title, event_package_id, venue_room_id, schedule_date, start_time, end_time, coordinator_name, status, notes) VALUES
(1, 'Grand Royal Wedding Setup', 1, 1, '2026-10-15', '09:00', '15:00', 'Robert Brown', 'SCHEDULED', 'Stage, floral decoration and banquet layout team arrival'),
(2, 'Corporate Leadership Summit Setup', 2, 4, '2026-11-05', '08:00', '17:00', 'Robert Brown', 'SCHEDULED', 'AV testing and simultaneous interpretation kit check'),
(3, 'VIP Birthday Celebration Setup', 3, 2, '2026-11-20', '10:00', '16:00', 'Robert Brown', 'SCHEDULED', 'Photo booth and LED lighting installation in garden'),
(4, 'Pinnacle Suite VIP Welcoming', NULL, 3, '2026-12-01', '14:00', '15:00', 'Alice Smith', 'SCHEDULED', 'Airport transfer coordination and champagne arrival setup'),
(5, 'Annual Gala Banquet Rehearsal', 4, 1, '2026-12-14', '16:00', '20:00', 'Robert Brown', 'SCHEDULED', 'Acoustic band sound-check and red carpet lighting review');
SET IDENTITY_INSERT dbo.event_schedules OFF;
GO

-- =====================================================================================
-- VERIFICATION QUERIES (Verify all tables have their datasets inserted)
-- =====================================================================================
SELECT 'users' AS [Table], COUNT(*) AS [RowCount] FROM dbo.users UNION ALL
SELECT 'customers', COUNT(*) FROM dbo.customers UNION ALL
SELECT 'employees', COUNT(*) FROM dbo.employees UNION ALL
SELECT 'venue_rooms', COUNT(*) FROM dbo.venue_rooms UNION ALL
SELECT 'event_packages', COUNT(*) FROM dbo.event_packages UNION ALL
SELECT 'package_services', COUNT(*) FROM dbo.package_services UNION ALL
SELECT 'reservations', COUNT(*) FROM dbo.reservations UNION ALL
SELECT 'invoices', COUNT(*) FROM dbo.invoices UNION ALL
SELECT 'payments', COUNT(*) FROM dbo.payments UNION ALL
SELECT 'guests', COUNT(*) FROM dbo.guests UNION ALL
SELECT 'leave_requests', COUNT(*) FROM dbo.leave_requests UNION ALL
SELECT 'staff_schedules', COUNT(*) FROM dbo.staff_schedules UNION ALL
SELECT 'resource_allocations', COUNT(*) FROM dbo.resource_allocations UNION ALL
SELECT 'complaints_feedback', COUNT(*) FROM dbo.complaints_feedback UNION ALL
SELECT 'announcements', COUNT(*) FROM dbo.announcements UNION ALL
SELECT 'activity_logs', COUNT(*) FROM dbo.activity_logs UNION ALL
SELECT 'notifications', COUNT(*) FROM dbo.notifications UNION ALL
SELECT 'room_categories', COUNT(*) FROM dbo.room_categories UNION ALL
SELECT 'facilities', COUNT(*) FROM dbo.facilities UNION ALL
SELECT 'promotions', COUNT(*) FROM dbo.promotions UNION ALL
SELECT 'event_schedules', COUNT(*) FROM dbo.event_schedules;
GO

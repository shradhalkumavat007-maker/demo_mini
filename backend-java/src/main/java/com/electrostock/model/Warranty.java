package com.electrostock.model;

import java.util.List;
import java.util.ArrayList;

public class Warranty {
    private String id;
    private String productId;
    private String productName;
    private String serialNumber;
    private String customerRef;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String startDate;
    private String endDate;
    private String status;
    private String notes;
    private List<WarrantyClaim> claims = new ArrayList<>();

    public Warranty() {}

    public Warranty(String id, String productId, String productName, String serialNumber, String customerRef,
                    String customerName, String customerEmail, String customerPhone, String startDate,
                    String endDate, String status, String notes, List<WarrantyClaim> claims) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.serialNumber = serialNumber;
        this.customerRef = customerRef;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.notes = notes;
        if (claims != null) {
            this.claims = claims;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getCustomerRef() { return customerRef; }
    public void setCustomerRef(String customerRef) { this.customerRef = customerRef; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<WarrantyClaim> getClaims() { return claims; }
    public void setClaims(List<WarrantyClaim> claims) { this.claims = claims; }
}

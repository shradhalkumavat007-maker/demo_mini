package com.electrostock.model;

import java.util.List;
import java.util.ArrayList;

public class Transaction {
    private String id;
    private String productId;
    private String productName;
    private String type;
    private int quantity;
    private double unitPrice;
    private double totalValue;
    private double purchaseCost;
    private double profitLoss;
    private String date;
    private String userId;
    private String userName;
    private String reference;
    private String customerRef;
    private String notes;
    private List<String> serialNumbers = new ArrayList<>();

    public Transaction() {}

    public Transaction(String id, String productId, String productName, String type, int quantity,
                       double unitPrice, double totalValue, double purchaseCost, double profitLoss,
                       String date, String userId, String userName, String reference, String customerRef,
                       String notes, List<String> serialNumbers) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.type = type;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalValue = totalValue;
        this.purchaseCost = purchaseCost;
        this.profitLoss = profitLoss;
        this.date = date;
        this.userId = userId;
        this.userName = userName;
        this.reference = reference;
        this.customerRef = customerRef;
        this.notes = notes;
        if (serialNumbers != null) {
            this.serialNumbers = serialNumbers;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public double getTotalValue() { return totalValue; }
    public void setTotalValue(double totalValue) { this.totalValue = totalValue; }

    public double getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(double purchaseCost) { this.purchaseCost = purchaseCost; }

    public double getProfitLoss() { return profitLoss; }
    public void setProfitLoss(double profitLoss) { this.profitLoss = profitLoss; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getCustomerRef() { return customerRef; }
    public void setCustomerRef(String customerRef) { this.customerRef = customerRef; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<String> getSerialNumbers() { return serialNumbers; }
    public void setSerialNumbers(List<String> serialNumbers) { this.serialNumbers = serialNumbers; }
}

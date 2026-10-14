package com.electrostock.model;

import java.util.List;
import java.util.ArrayList;

public class PurchaseOrder {
    private String id;
    private String poNumber;
    private String supplierId;
    private String supplierName;
    private List<PurchaseOrderItem> items = new ArrayList<>();
    private double totalCost;
    private String status;
    private String createdDate;
    private String expectedDate;
    private String receivedDate;
    private String userId;
    private String userName;
    private String notes;

    public PurchaseOrder() {}

    public PurchaseOrder(String id, String poNumber, String supplierId, String supplierName,
                         List<PurchaseOrderItem> items, double totalCost, String status,
                         String createdDate, String expectedDate, String receivedDate,
                         String userId, String userName, String notes) {
        this.id = id;
        this.poNumber = poNumber;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        if (items != null) {
            this.items = items;
        }
        this.totalCost = totalCost;
        this.status = status;
        this.createdDate = createdDate;
        this.expectedDate = expectedDate;
        this.receivedDate = receivedDate;
        this.userId = userId;
        this.userName = userName;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public String getSupplierId() { return supplierId; }
    public void setSupplierId(String supplierId) { this.supplierId = supplierId; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public List<PurchaseOrderItem> getItems() { return items; }
    public void setItems(List<PurchaseOrderItem> items) { this.items = items; }

    public double getTotalCost() { return totalCost; }
    public void setTotalCost(double totalCost) { this.totalCost = totalCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }

    public String getExpectedDate() { return expectedDate; }
    public void setExpectedDate(String expectedDate) { this.expectedDate = expectedDate; }

    public String getReceivedDate() { return receivedDate; }
    public void setReceivedDate(String receivedDate) { this.receivedDate = receivedDate; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

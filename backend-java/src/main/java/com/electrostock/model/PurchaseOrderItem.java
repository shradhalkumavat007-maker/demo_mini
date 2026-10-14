package com.electrostock.model;

public class PurchaseOrderItem {
    private String productId;
    private String productName;
    private int quantity;
    private int receivedQuantity;
    private double unitPrice;
    private double total;

    public PurchaseOrderItem() {}

    public PurchaseOrderItem(String productId, String productName, int quantity, int receivedQuantity, double unitPrice, double total) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.receivedQuantity = receivedQuantity;
        this.unitPrice = unitPrice;
        this.total = total;
    }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public int getReceivedQuantity() { return receivedQuantity; }
    public void setReceivedQuantity(int receivedQuantity) { this.receivedQuantity = receivedQuantity; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }
}

package com.electrostock.model;

public class SerialImei {
    private String id;
    private String productId;
    private String productName;
    private String serialNumber;
    private String imei;
    private String status;
    private String warrantyId;
    private String dateAdded;
    private String dateSold;
    private String customerRef;

    public SerialImei() {}

    public SerialImei(String id, String productId, String productName, String serialNumber,
                      String imei, String status, String warrantyId, String dateAdded,
                      String dateSold, String customerRef) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.serialNumber = serialNumber;
        this.imei = imei;
        this.status = status;
        this.warrantyId = warrantyId;
        this.dateAdded = dateAdded;
        this.dateSold = dateSold;
        this.customerRef = customerRef;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getImei() { return imei; }
    public void setImei(String imei) { this.imei = imei; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getWarrantyId() { return warrantyId; }
    public void setWarrantyId(String warrantyId) { this.warrantyId = warrantyId; }

    public String getDateAdded() { return dateAdded; }
    public void setDateAdded(String dateAdded) { this.dateAdded = dateAdded; }

    public String getDateSold() { return dateSold; }
    public void setDateSold(String dateSold) { this.dateSold = dateSold; }

    public String getCustomerRef() { return customerRef; }
    public void setCustomerRef(String customerRef) { this.customerRef = customerRef; }
}

package com.electrostock.model;

public class Product {
    private String id;
    private String name;
    private String sku;
    private String categoryId;
    private String brand;
    private String model;
    private String supplierId;
    private int stock;
    private int minStock;
    private double purchasePrice;
    private double sellingPrice;
    private int warrantyPeriodMonths;
    private String description;
    private String imageUrl;
    private String createdAt;
    private String updatedAt;

    public Product() {}

    public Product(String id, String name, String sku, String categoryId, String brand, String model,
                   String supplierId, int stock, int minStock, double purchasePrice, double sellingPrice,
                   int warrantyPeriodMonths, String description, String imageUrl, String createdAt, String updatedAt) {
        this.id = id;
        this.name = name;
        this.sku = sku;
        this.categoryId = categoryId;
        this.brand = brand;
        this.model = model;
        this.supplierId = supplierId;
        this.stock = stock;
        this.minStock = minStock;
        this.purchasePrice = purchasePrice;
        this.sellingPrice = sellingPrice;
        this.warrantyPeriodMonths = warrantyPeriodMonths;
        this.description = description;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getSupplierId() { return supplierId; }
    public void setSupplierId(String supplierId) { this.supplierId = supplierId; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public int getMinStock() { return minStock; }
    public void setMinStock(int minStock) { this.minStock = minStock; }

    public double getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(double purchasePrice) { this.purchasePrice = purchasePrice; }

    public double getSellingPrice() { return sellingPrice; }
    public void setSellingPrice(double sellingPrice) { this.sellingPrice = sellingPrice; }

    public int getWarrantyPeriodMonths() { return warrantyPeriodMonths; }
    public void setWarrantyPeriodMonths(int warrantyPeriodMonths) { this.warrantyPeriodMonths = warrantyPeriodMonths; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}

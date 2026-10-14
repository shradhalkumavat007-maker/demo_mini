package com.electrostock.model;

public class SystemSettings {
    private String storeName = "ElectroStock Electronics";
    private String storeEmail = "support@electrostock.internal";
    private String storePhone = "+91 98765 43210";
    private String storeAddress = "Electronics Hub, Tech City, Karnataka 560001";
    private String currency = "INR";
    private String currencySymbol = "₹";
    private double taxRate = 18.0;
    private int lowStockThresholdDefault = 5;
    private boolean autoAlertLowStock = true;
    private boolean autoAlertExpiringWarranty = true;
    private int warrantyExpiryWarningDays = 30;
    private boolean enableSoundAlerts = false;
    private String theme = "system";

    public SystemSettings() {}

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getStoreEmail() { return storeEmail; }
    public void setStoreEmail(String storeEmail) { this.storeEmail = storeEmail; }

    public String getStorePhone() { return storePhone; }
    public void setStorePhone(String storePhone) { this.storePhone = storePhone; }

    public String getStoreAddress() { return storeAddress; }
    public void setStoreAddress(String storeAddress) { this.storeAddress = storeAddress; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getCurrencySymbol() { return currencySymbol; }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public double getTaxRate() { return taxRate; }
    public void setTaxRate(double taxRate) { this.taxRate = taxRate; }

    public int getLowStockThresholdDefault() { return lowStockThresholdDefault; }
    public void setLowStockThresholdDefault(int lowStockThresholdDefault) { this.lowStockThresholdDefault = lowStockThresholdDefault; }

    public boolean isAutoAlertLowStock() { return autoAlertLowStock; }
    public void setAutoAlertLowStock(boolean autoAlertLowStock) { this.autoAlertLowStock = autoAlertLowStock; }

    public boolean isAutoAlertExpiringWarranty() { return autoAlertExpiringWarranty; }
    public void setAutoAlertExpiringWarranty(boolean autoAlertExpiringWarranty) { this.autoAlertExpiringWarranty = autoAlertExpiringWarranty; }

    public int getWarrantyExpiryWarningDays() { return warrantyExpiryWarningDays; }
    public void setWarrantyExpiryWarningDays(int warrantyExpiryWarningDays) { this.warrantyExpiryWarningDays = warrantyExpiryWarningDays; }

    public boolean isEnableSoundAlerts() { return enableSoundAlerts; }
    public void setEnableSoundAlerts(boolean enableSoundAlerts) { this.enableSoundAlerts = enableSoundAlerts; }

    public String getTheme() { return theme; }
    public void setTheme(String theme) { this.theme = theme; }
}

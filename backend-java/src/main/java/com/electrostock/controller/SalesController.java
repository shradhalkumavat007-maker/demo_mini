package com.electrostock.controller;

import com.electrostock.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "*")
public class SalesController {

    private final DataStore store = DataStore.getInstance();

    /**
     * POST /api/sales/checkout
     * Processes a full POS sale — deducts stock for each item, creates transactions, issues warranties.
     * Body: { customer, items: [{productId, productName, quantity, unitPrice, discount, serialNumbers, ...}],
     *         subtotal, discount, grandTotal, paymentMethod, paymentReference, notes }
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> customer = (Map<String, Object>) body.getOrDefault("customer", new HashMap<>());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) body.getOrDefault("items", new ArrayList<>());

            String customerName = (String) customer.getOrDefault("name", "Walk-in Customer");
            String customerPhone = (String) customer.getOrDefault("phone", "");
            String paymentMethod = (String) body.getOrDefault("paymentMethod", "cash");
            String paymentRef = (String) body.getOrDefault("paymentReference", "");
            String notes = (String) body.getOrDefault("notes", "");

            double grandTotal = ((Number) body.getOrDefault("grandTotal", 0.0)).doubleValue();
            double orderDiscount = ((Number) body.getOrDefault("discount", 0.0)).doubleValue();

            if (items.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Cart is empty. Add items before checkout."));
            }

            String receiptNumber = "RCP-" + System.currentTimeMillis() % 10000000;
            String now = Instant.now().toString();
            List<Map<String, Object>> receiptItems = new ArrayList<>();
            List<String> transactionIds = new ArrayList<>();

            for (Map<String, Object> item : items) {
                String productId = (String) item.get("productId");
                String productName = (String) item.getOrDefault("productName", "Unknown Product");
                int qty = ((Number) item.getOrDefault("quantity", 1)).intValue();
                double unitPrice = ((Number) item.getOrDefault("unitPrice", 0.0)).doubleValue();
                double itemDiscount = ((Number) item.getOrDefault("discount", 0.0)).doubleValue();
                @SuppressWarnings("unchecked")
                List<String> serialNumbers = (List<String>) item.get("serialNumbers");

                // Stock out via DataStore
                Map<String, Object> result = store.stockOut(
                    productId, qty, unitPrice,
                    "usr-1", "Admin",
                    customerName, notes,
                    serialNumbers
                );

                if (!Boolean.TRUE.equals(result.get("success"))) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "Stock error for " + productName + ": " + result.get("error")
                    ));
                }

                Map<String, Object> receiptItem = new HashMap<>(item);
                receiptItem.put("total", unitPrice * qty - itemDiscount);
                receiptItems.add(receiptItem);
            }

            // Build receipt
            Map<String, Object> receipt = new HashMap<>();
            receipt.put("receiptNumber", receiptNumber);
            receipt.put("createdAt", now);
            receipt.put("customer", customer);
            receipt.put("items", receiptItems);
            receipt.put("subtotal", body.getOrDefault("subtotal", grandTotal));
            receipt.put("discount", orderDiscount);
            receipt.put("grandTotal", grandTotal);
            receipt.put("paymentMethod", paymentMethod);
            receipt.put("paymentReference", paymentRef);
            receipt.put("notes", notes);
            receipt.put("status", "completed");

            // Save receipt in DataStore
            store.addReceipt(receiptNumber, receipt);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "receipt", receipt,
                "receiptNumber", receiptNumber
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Checkout failed: " + e.getMessage()));
        }
    }

    /** GET /api/sales/receipts — list all sale receipts */
    @GetMapping("/receipts")
    public ResponseEntity<?> getReceipts() {
        return ResponseEntity.ok(store.getReceipts());
    }

    /** GET /api/sales/receipts/{id} — get single receipt */
    @GetMapping("/receipts/{id}")
    public ResponseEntity<?> getReceipt(@PathVariable String id) {
        Map<String, Object> receipt = store.getReceipt(id);
        if (receipt == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(receipt);
    }
}

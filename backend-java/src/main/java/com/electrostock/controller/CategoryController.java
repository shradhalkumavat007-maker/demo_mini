package com.electrostock.controller;

import com.electrostock.model.Category;
import com.electrostock.model.Supplier;
import com.electrostock.service.DataStore;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final DataStore store = DataStore.getInstance();

    @GetMapping("/categories")
    public List<Category> getCategories() {
        return store.getCategories();
    }

    @PostMapping("/categories")
    public ResponseEntity<Category> createCategory(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "New Category");
        String desc = body.getOrDefault("description", "");
        Category c = store.addCategory(name, desc);
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Void> updateCategory(@PathVariable String id, @RequestBody Map<String, String> body) {
        boolean ok = store.updateCategory(id, body.getOrDefault("name", ""), body.getOrDefault("description", ""));
        return ok ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        boolean ok = store.deleteCategory(id);
        return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/suppliers")
    public List<Supplier> getSuppliers() {
        return store.getSuppliers();
    }

    @GetMapping("/suppliers/{id}")
    public ResponseEntity<Supplier> getSupplierById(@PathVariable String id) {
        return store.getSupplierById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/suppliers")
    public ResponseEntity<Supplier> createSupplier(@RequestBody Supplier supplier) {
        Supplier created = store.addSupplier(supplier);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/suppliers/{id}")
    public ResponseEntity<Supplier> updateSupplier(@PathVariable String id, @RequestBody Supplier supplier) {
        boolean ok = store.updateSupplier(id, supplier);
        return ok ? ResponseEntity.ok(supplier) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/suppliers/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable String id) {
        boolean ok = store.deleteSupplier(id);
        return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

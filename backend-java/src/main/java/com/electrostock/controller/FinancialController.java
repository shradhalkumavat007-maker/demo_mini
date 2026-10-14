package com.electrostock.controller;

import com.electrostock.model.Alert;
import com.electrostock.model.SystemSettings;
import com.electrostock.model.User;
import com.electrostock.service.DataStore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FinancialController {

    private final DataStore store = DataStore.getInstance();

    @GetMapping("/reorder")
    public List<Map<String, Object>> getReorderSuggestions() {
        return store.getReorderSuggestions();
    }

    @GetMapping("/profit-loss")
    public Map<String, Object> getProfitLoss() {
        return store.getProfitLossAnalytics();
    }

    @GetMapping("/alerts")
    public List<Alert> getAlerts() {
        return store.getAlerts();
    }

    @PutMapping("/alerts/{id}/read")
    public ResponseEntity<?> markAlertRead(@PathVariable String id) {
        store.markAlertRead(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/alerts/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable String id) {
        store.resolveAlert(id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return store.getUsers();
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        User created = store.addUser(user);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) {
        boolean ok = store.updateUser(id, user);
        return ok ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        boolean ok = store.deleteUser(id);
        return ok ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/settings")
    public SystemSettings getSettings() {
        return store.getSettings();
    }

    @PutMapping("/settings")
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings settings) {
        store.updateSettings(settings);
        return ResponseEntity.ok(settings);
    }
}

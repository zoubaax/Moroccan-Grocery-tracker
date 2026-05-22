package com.hanotak.backend.controller;

import com.hanotak.backend.model.Category;
import com.hanotak.backend.model.Product;
import com.hanotak.backend.repository.CategoryRepository;
import com.hanotak.backend.repository.ProductRepository;
import com.hanotak.backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

  @GetMapping
  @PreAuthorize("isAuthenticated()")
  public List<Product> getAllProducts() {
    return productRepository.findAll();
  }

  @GetMapping("/barcode/{barcode}")
  @PreAuthorize("isAuthenticated()")
  public ResponseEntity<Product> getProductByBarcode(@PathVariable String barcode) {
    return productRepository.findByBarcode(barcode)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> createProduct(
            @RequestParam("name") String name,
            @RequestParam("barcode") String barcode,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        Product product = new Product(name, barcode, price, stockQuantity);
        product.setDescription(description);

        if (category != null && !category.isEmpty()) {
            Category cat = categoryRepository.findByName(category)
                    .orElseGet(() -> categoryRepository.save(new Category(category)));
            product.setCategory(cat);
        }

        if (image != null && !image.isEmpty()) {
            Map uploadResult = cloudinaryService.uploadImage(image);
            product.setImageUrl(uploadResult.get("url").toString());
        }

        productRepository.save(product);
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("barcode") String barcode,
            @RequestParam("price") BigDecimal price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Product not found."));

        product.setName(name);
        product.setBarcode(barcode);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setDescription(description);

        if (category != null && !category.isEmpty()) {
            Category cat = categoryRepository.findByName(category)
                    .orElseGet(() -> categoryRepository.save(new Category(category)));
            product.setCategory(cat);
        }

        if (image != null && !image.isEmpty()) {
            Map uploadResult = cloudinaryService.uploadImage(image);
            product.setImageUrl(uploadResult.get("url").toString());
        }

        productRepository.save(product);
        return ResponseEntity.ok(product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}

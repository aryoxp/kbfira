# CoreAutoloader

core/lib/CoreAutoloader.php



## Class Loading Priority

- coreLibLoader

- coreDriverLoader

- coreApiLoader

- coreCvsLoader

- appLibraryLoader

- appControllerLoader

- appServiceLoader

- appModelLoader



## Register Custom Class Loader

```php
public static function register($loader) {
  spl_autoload_register($loader); 
}
```


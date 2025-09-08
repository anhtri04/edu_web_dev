// Performance optimization utilities
export class PerformanceOptimizer {
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  static memoize(fn) {
    const cache = new Map();
    return function(...args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }

  static lazyLoad(selector, callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    const observerOptions = { ...defaultOptions, ...options };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll(selector);
    elements.forEach(el => observer.observe(el));

    return observer;
  }

  static preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  static batchDOMOperations(operations) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        operations.forEach(op => op());
        resolve();
      });
    });
  }

  static measurePerformance(name, fn) {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }

  static async measureAsyncPerformance(name, asyncFn) {
    const start = performance.now();
    const result = await asyncFn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }

  static optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => {
      imageObserver.observe(img);
    });
  }

  static createVirtualScroll(container, items, itemHeight, renderItem) {
    const containerHeight = container.clientHeight;
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const bufferSize = 5;
    
    let scrollTop = 0;
    let startIndex = 0;
    let endIndex = Math.min(items.length, visibleItems + bufferSize);

    const totalHeight = items.length * itemHeight;
    const viewport = document.createElement('div');
    viewport.style.height = `${totalHeight}px`;
    viewport.style.position = 'relative';

    const renderVisibleItems = () => {
      viewport.innerHTML = '';
      
      for (let i = startIndex; i < endIndex; i++) {
        if (items[i]) {
          const item = renderItem(items[i], i);
          item.style.position = 'absolute';
          item.style.top = `${i * itemHeight}px`;
          item.style.height = `${itemHeight}px`;
          viewport.appendChild(item);
        }
      }
    };

    const handleScroll = this.throttle(() => {
      scrollTop = container.scrollTop;
      startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
      endIndex = Math.min(items.length, startIndex + visibleItems + bufferSize * 2);
      renderVisibleItems();
    }, 16);

    container.addEventListener('scroll', handleScroll);
    container.appendChild(viewport);
    renderVisibleItems();

    return {
      update: (newItems) => {
        items = newItems;
        viewport.style.height = `${items.length * itemHeight}px`;
        renderVisibleItems();
      },
      destroy: () => {
        container.removeEventListener('scroll', handleScroll);
        container.removeChild(viewport);
      }
    };
  }

  static cacheManager = {
    cache: new Map(),
    
    set(key, value, ttl = 300000) { // 5 minutes default
      const expiry = Date.now() + ttl;
      this.cache.set(key, { value, expiry });
    },

    get(key) {
      const item = this.cache.get(key);
      if (!item) return null;
      
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }
      
      return item.value;
    },

    clear() {
      this.cache.clear();
    },

    cleanup() {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
        }
      }
    }
  };

  static requestIdleCallback(callback, options = {}) {
    if (window.requestIdleCallback) {
      return window.requestIdleCallback(callback, options);
    } else {
      // Fallback for browsers that don't support requestIdleCallback
      return setTimeout(() => {
        const start = Date.now();
        callback({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, 1);
    }
  }

  static bundleRequests(requests, delay = 100) {
    let bundle = [];
    let timeoutId = null;

    return function(request) {
      bundle.push(request);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        const currentBundle = [...bundle];
        bundle = [];
        
        try {
          // Process all requests in the bundle
          const results = await Promise.allSettled(
            currentBundle.map(req => req())
          );
          return results;
        } catch (error) {
          console.error('Bundled request error:', error);
        }
      }, delay);
    };
  }

  static resourceHints = {
    preload(href, as) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = as;
      document.head.appendChild(link);
    },

    prefetch(href) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    },

    preconnect(href) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      document.head.appendChild(link);
    }
  };

  static webWorkerManager = {
    workers: new Map(),

    create(name, script) {
      if (this.workers.has(name)) {
        return this.workers.get(name);
      }

      const worker = new Worker(script);
      this.workers.set(name, worker);
      return worker;
    },

    terminate(name) {
      const worker = this.workers.get(name);
      if (worker) {
        worker.terminate();
        this.workers.delete(name);
      }
    },

    terminateAll() {
      for (const [name, worker] of this.workers.entries()) {
        worker.terminate();
      }
      this.workers.clear();
    }
  };
}

// React-specific performance hooks
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useThrottle = (value, limit) => {
  const [throttledValue, setThrottledValue] = React.useState(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

export const useMemoizedCallback = (callback, dependencies) => {
  return React.useCallback(callback, dependencies);
};

export const useIntersectionObserver = (options = {}) => {
  const [entry, setEntry] = React.useState();
  const [node, setNode] = React.useState();

  React.useEffect(() => {
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
    }, options);

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node, options]);

  return [setNode, entry];
};

// Performance monitoring
export class PerformanceMonitor {
  static metrics = {
    apiCalls: 0,
    renderCount: 0,
    errorCount: 0,
    memoryUsage: 0
  };

  static trackApiCall() {
    this.metrics.apiCalls++;
  }

  static trackRender() {
    this.metrics.renderCount++;
  }

  static trackError() {
    this.metrics.errorCount++;
  }

  static updateMemoryUsage() {
    if (performance.memory) {
      this.metrics.memoryUsage = performance.memory.usedJSHeapSize;
    }
  }

  static getMetrics() {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  static reset() {
    this.metrics = {
      apiCalls: 0,
      renderCount: 0,
      errorCount: 0,
      memoryUsage: 0
    };
  }
}

export default PerformanceOptimizer;
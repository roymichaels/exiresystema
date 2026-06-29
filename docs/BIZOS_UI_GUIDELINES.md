# BizOS UI GUIDELINES

## Overview

The BizOS UI Guidelines establish **comprehensive visual standards and interaction patterns** for the BizOS platform, ensuring a **premium, professional user experience** while maintaining consistency across all business tenant implementations.

**Purpose**: Define UI standards, patterns, and best practices for BizOS component development and design.

**Scope**: All UI components, layouts, interactions, and visual elements within the BizOS platform.

**Core Philosophy**: **Platform-First, Tenant-Aware** approach with clear visual separation between platform and tenant-specific implementations.

## UI Design Principles

### **1. One-Header Rule**
**Mandatory Single Header**: Each page must have exactly one primary header element
- **Header Hierarchy**: Use H1 for main page title, H2+ for sub-sections
- **Header Consistency**: Standardized header structure across all platform pages
- **Header Content**: Include title, breadcrumb navigation, and action controls
- **Header Positioning**: Fixed or sticky positioning for optimal user experience

**Implementation Guidelines**:
```typescript
// ✅ Correct implementation
<PageHeader title="Dashboard">
  <Breadcrumb path="/dashboard" />
  <HeaderActions />
</PageHeader>

// ❌ Incorrect - duplicate headers
<PageHeader title="Dashboard" /> // First header
<SectionHeader title="Overview" /> // Second header - VIOLATION
```

### **2. No Duplicate Headers**
**Prevention of Redundant Headers**: Eliminate duplicate or redundant header elements
- **Header Uniqueness**: Each page section should have a single, meaningful header
- **Semantic HTML**: Use appropriate heading levels for content structure
- **Accessibility**: Ensure proper heading hierarchy for screen readers
- **User Experience**: Prevent confusion with multiple similar headers

**Detection Rules**:
```javascript
// Header duplication detection logic
function detectDuplicateHeaders() {
  const headers = document.queryElements('h1, h2, h3, h4, h5, h6');
  const headerTexts = headers.map(h => h.textContent.trim().toLowerCase());
  
  const duplicates = headerTexts.filter((text, index) => 
    headerTexts.indexOf(text) !== index && index > 0
  );
  
  if (duplicates.length > 0) {
    console.warn('⚠️ Duplicate headers detected:', duplicates);
    return false; // Header validation failed
  }
  
  return true; // Header validation passed
}
```

### **3. Mobile-First Safety**
**Responsive Design Priority**: Design for mobile devices first, then enhance for larger screens
- **Mobile-First Breakpoints**: Optimize for mobile devices (<768px)
- **Progressive Enhancement**: Add features for larger screens
- **Touch Target Minimums**: Ensure minimum 44px touch targets
- **Mobile Performance**: Optimize for mobile network conditions

**Breakpoints Implementation**:
```css
/* Mobile-First Approach */
@media (max-width: 767px) {
  /* Mobile styles */
  .header {
    height: 56px;
    font-size: 1.2rem;
  }
  
  .nav-item {
    min-height: 44px;
    min-width: 44px;
  }
}

@media (min-width: 768px) {
  /* Desktop/Tablet styles */
  .header {
    height: 72px;
    font-size: 1.5rem;
  }
  
  .nav-item {
    min-height: 40px;
    min-width: 40px;
  }
}
```

### **4. Desktop Spacing**
**Consistent Visual Rhythm**: Maintain consistent spacing across desktop layouts
- **Grid System**: Use 8px-based grid system for consistent spacing
- **Component Spacing**: Standardized margins and padding between components
- **Page Layout**: Consistent spacing between sections and content areas
- **Visual Hierarchy**: Use spacing to establish content importance

**Spacing Guidelines**:
```css
/* Spacing Scale */
.spacing-0 { margin: 0; }
.spacing-1 { margin: 8px; }
.spacing-2 { margin: 16px; }
.spacing-3 { margin: 24px; }
.spacing-4 { margin: 32px; }
.spacing-5 { margin: 48px; }
.spacing-6 { margin: 64px; }

/* Component Spacing */
.component-gap { gap: 24px; }
.section-gap { margin-bottom: 32px; }
.content-gap { margin-bottom: 24px; }
```

### **5. Bottom Navigation Behavior**
**Predictable Navigation System**: Standardized bottom navigation with consistent behavior
- **Universal Placement**: Bottom navigation on all platform pages
- **Minimal Design**: Clean, unobtrusive navigation panel
- **Active State Indicators**: Clear visual feedback for active navigation
- **Accessibility Support**: Screen reader compatibility and keyboard navigation

**Bottom Nav Specifications**:
```typescript
interface BottomNavItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  badge?: number;
  isActive: boolean;
}

// BottomNav Component Requirements
const BottomNav = () => {
  return (
    <nav className="bottom-navigation" role="navigation" aria-label="Main navigation">
      {navItems.map(item => (
        <NavItem
          key={item.id}
          {...item}
          className={item.isActive ? 'active' : ''}
          'aria-current={item.isActive ? 'page' : undefined}'
        />
      ))}
    </nav>
  );
};
```

### **6. Drawer and Chat Widget Behavior**
**Consistent Panel Management**: Standardized drawer and chat widget behavior
- **Drawer Animation**: Smooth slide-in/slide-out animations
- **Chat Widget Positioning**: Fixed positioning with easy access
- **State Management**: Consistent state handling across drawers
- **Accessibility**: Screen reader support for panel content

**Drawer Component Guidelines**:
```typescript
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right' | 'bottom';
  title: string;
  children: React.ReactNode;
}

const Drawer = ({ isOpen, onClose, position = 'right', title, children }: DrawerProps) => {
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  return (
    <div className={`drawer ${position} ${isOpen ? 'open' : ''}`}>
      <div className="drawer-header">
        <h2>{title}</h2>
        <button onClick={onClose} aria-label="Close drawer">
          ✕
        </button>
      </div>
      <div className="drawer-content">
        {children}
      </div>
    </div>
  );
};
```

### **7. Touch Target Minimums**
**Accessible Interaction Areas**: Minimum touch target dimensions for optimal usability
- **Desktop Minimum**: 40px width x 40px height
- **Mobile Minimum**: 44px width x 44px height
- **Button Elements**: All interactive elements meet size requirements
- **Icon-only Buttons**: Ensure minimum visible area for interaction

**Touch Target Validation**:
```javascript
function validateTouchTargets() {
  const interactiveElements = document.querySelectorAll(
    'button, a, input, select, textarea, [role="button"], [role="checkbox"], [role="radio"]'
  );
  
  const violations = [];
  interactiveElements.forEach((element, index) => {
    const rect = element.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const minSize = window.innerWidth <= 768 ? 44 : 40;
    
    if (width < minSize || height < minSize) {
      violations.push({
        element: element.tagName,
        id: element.id || element.className,
        dimensions: { width, height },
        required: minSize,
        index: index
      });
    }
  });
  
  return violations;
}
```

### **8. No Blinking/Pulsing Unless Purposeful**
**Visual Stability**: Prevent distracting visual effects
- **Static Elements**: No unwanted blinking or pulsing animations
- **Purposeful Animations**: Only intentional, user-beneficial animations
- **Reduced Motion Support**: Respect user's motion preferences
- **Performance Considerations**: Avoid CPU-intensive animations

**Visual Stability Validation**:
```css
/* Use 'auto' or 'revert-layer' for animations to avoid unwanted blinker */
.animated-element {
  animation: none; /* No default animations */
}

/* Purposeful animations only when explicitly enabled */
@keyframes purposeful-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.purposeful-blink {
  animation: purposeful-blink 3s infinite;
}

/* Respect motion preferences */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### ** kencangPremium Business OS Feeling**
**Professional Appearance**: Premium, professional visual language and design
- **Visual Hierarchy**: Clear content and interaction prioritization
- **Quality Assurance**: High standards for visual polish and finish
- **Brand Consistency**: Consistent brand application across platform
- **Business Context**: Design optimized for business use cases

**Premium Design Guidelines**:
```css
/* Premium visual elements */
.premium-surface {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe5 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.premium-button {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.premium-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}
```

### **11. App Shell vs Tenant Branding Separation**
**Visual Distinction**: Clear visual separation between platform and tenant components
- **Platform Styling**: Platform-branded, neutral visual elements
- **Tenant Customization**: Tenant-specific branding without interfering with platform
- **Context Awareness**: Visual elements reflect platform vs tenant context
- **Consistency Rules**: Maintain consistent styling patterns within each context

**Visual Separation Guidelines**:
```typescript
interface PlatformComponentProps {
  isPlatform?: boolean;
  isTenant?: boolean;
  variant?: 'platform' | 'tenant';
}

const PlatformComponent = ({ 
  isPlatform = false, 
  isTenant = false, 
  variant = 'platform',
  ...props 
}: PlatformComponentProps) => {
  const getStyles = () => {
    if (variant === 'platform') {
      return {
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
      };
    } else {
      return {
        backgroundColor: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      };
    }
  };
  
  return (
    <div style={getStyles()} {...props}>
      {props.children}
    </div>
  );
};
```

## Component Standards

### **1. Header Component**
```typescript
interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  showMobileMenu?: boolean;
}

const Header = ({ title, subtitle, actions, showMobileMenu }: HeaderProps) => {
  return (
    <header className="page-header" role="banner">
      <div className="header-content">
        <div className="header-title-section">
          <h1 className="header-title">{title}</h1>
          {subtitle && <p className="header-subtitle">{subtitle}</p>}
        </div>
        
        {actions && <div className="header-actions">{actions}</div>}
        
        {showMobileMenu && (
          <button className="mobile-menu-toggle" aria-label="Toggle menu">
            ☰
          </button>
        )}
      </div>
    </header>
  );
};
```

### **2. Navigation Component**
```typescript
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  path: string;
  badge?: number;
  isActive?: boolean;
  requiresAuth?: boolean;
}

const Navigation = ({ items }: { items: NavigationItem[] }) => {
  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <ul className="nav-list">
        {items.map((item) => (
          <li key={item.id} className="nav-item">
            <a
              href={item.path}
              className={`nav-link ${item.isActive ? 'active' : ''}`}
              aria-current={item.isActive ? 'page' : undefined}
              aria-label={item.label}
              title={item.label}
            >
              <item.icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="nav-badge" aria-label={` ${item.badge} notifications`}>
                  {item.badge}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};
```

### **3. Button Component**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onClick, 
  children, 
  className = '' 
}: ButtonProps) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger'
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    xl: 'btn-xl'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''}`;
  
  return (
    <button
      className={classes}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
    >
      {loading && <span className="btn-spinner" aria-hidden="true">⏳</span>}
      <span className={loading ? 'sr-only' : ''}>{children}</span>
    </button>
  );
};
```

### **4. Card Component**
```typescript
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Card = ({ 
  title, 
  subtitle, 
  actions, 
  className = '', 
  padding = 'md'
}: CardProps) => {
  const paddingClasses = {
    none: 'card-padding-none',
    sm: 'card-padding-sm',
    md: 'card-padding-md',
    lg: 'card-padding-lg',
    xl: 'card-padding-xl'
  };
  
  return (
    <div className={`card ${paddingClasses[padding]} ${className}`}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-content">
        {props.children}
      </div>
    </div>
  );
};
```

### **5. Form Component**
```typescript
interface FormProps {
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  className?: string;
  children: React.ReactNode;
}

const Form = ({ onSubmit, className = '', children }: FormProps) => {
  return (
    <form 
      className={`form ${className}`} 
      onSubmit={onSubmit}
      noValidate
    >
      {children}
    </form>
  );
};

interface FormGroupProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FormGroup = ({ label, error, required, className = '', children }: FormGroupProps) => {
  return (
    <div className={`form-group ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-indicator" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="form-control">
        {children}
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};
```

## Theme System

### **1. CSS Custom Properties**
```css
:root {
  /* Primary Colors */
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  
  /* Secondary Colors */
  --secondary-50: #f8fafc;
  --secondary-100: #f1f5f9;
  --secondary-500: #64748b;
  --secondary-600: #475569;
  
  /* Success Colors */
  --success-50: #f0fdf4;
  --success-500: #22c55e;
  --success-600: #16a34a;
  
  /* Warning Colors */
  --warning-50: #fef3c7;
  --warning-500: #f59e0b;
  --warning-600: #d97706;
  
  /* Error Colors */
  --error-50: #fef2f2;
  --error-500: #ef4444;
  --error-600: #dc2626;
  
  /* Neutral Colors */
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
  
  /* Typography */
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem;   /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
  --font-size-2xl: 1.5rem; /* 24px */
  --font-size-3xl: 1.875rem; /* 30px */
  --font-size-4xl: 2.25rem; /* 36px */
  
  /* Spacing */
  --spacing-0: 0;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 16px;
  --spacing-4: 24px;
  --spacing-5: 32px;
  --spacing-6: 48px;
  --spacing-7: 64px;
  --spacing-8: 96px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

### **2. Theme Variants**
```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
  };
  typography: {
    fontFamily: string;
    fontSizes: Record<string, string>;
    fontWeights: Record<string, string>;
  };
  spacing: Record<string, string>;
  borders: Record<string, string>;
  shadows: Record<string, string>;
}

const theme: Theme = {
  colors: {
    primary: 'var(--primary-600)',
    secondary: 'var(--secondary-600)',
    success: 'var(--success-600)',
    warning: 'var(--warning-600)',
    error: 'var(--error-600)',
    neutral: 'var(--neutral-600)',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizes: {
      xs: 'var(--font-size-xs)',
      sm: 'var(--font-size-sm)',
      base: 'var(--font-size-base)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)',
      '2xl': 'var(--font-size-2xl)',
      '3xl': 'var(--font-size-3xl)',
      '4xl': 'var(--font-size-4xl)',
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  spacing: {
    '0': 'var(--spacing-0)',
    '1': 'var(--spacing-1)',
    '2': 'var(--spacing-2)',
    '3': 'var(--spacing-3)',
    '4': 'var(--spacing-4)',
    '5': 'var(--spacing-5)',
    '6': 'var(--spacing-6)',
    '7': 'var(--spacing-7)',
    '8': 'var(--spacing-8)',
  },
  borders: {
    none: 'none',
    sm: '1px solid var(--neutral-200)',
    md: '1px solid var(--neutral-300)',
    lg: '1px solid var(--neutral-400)',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
};

// Theme Provider
const ThemeContext = createContext<{ theme: Theme } | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeValue = theme;
  
  return (
    <ThemeContext.Provider value={{ theme: themeValue }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

## Component Accessibility

### **1. ARIA Requirements**
```typescript
interface AccessibleComponentProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date';
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-disabled'?: boolean;
}
```

### **2. Keyboard Navigation**
```typescript
// Keyboard navigation handlers
const useKeyboardNavigation = (
  onNext: () => void,
  onPrevious: () => void,
  onEnter: () => void,
  onEscape: () => void,
  isDisabled?: boolean
) => {
  useEffect(() => {
    if (isDisabled) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          onNext();
          break;
          
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          onPrevious();
          break;
          
        case 'Enter':
        case ' ':
          event.preventDefault();
          onEnter();
          break;
          
        case 'Escape':
          event.preventDefault();
          onEscape();
          break;
          
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrevious, onEnter, onEscape, isDisabled]);
};
```

## Testing Guidelines

### **1. Visual Regression Testing**
```typescript
// Example for visual regression testing
it('renders correctly in different screen sizes', () => {
  const { container } = render(<Component />);
  
  // Desktop view
  global.innerWidth = 1200;
  expect(container).toMatchSnapshot('desktop');
  
  // Tablet view
  global.innerWidth = 768;
  expect(container).toMatchSnapshot('tablet');
  
  // Mobile view
  global.innerWidth = 375;
  expect(container).toMatchSnapshot('mobile');
});
```

### **2. Accessibility Testing**
```typescript
it('maintains accessibility standards', () => {
  const { container } = render(<Component />);
  
  // Check for ARIA labels
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    const ariaLabel = button.getAttribute('aria-label');
    const textContent = button.textContent;
    
    expect(ariaLabel || textContent).toBeTruthy();
  });
  
  // Check keyboard navigation
  const focusableElements = container.querySelectorAll(
    'button, a, input, select, textarea, [tabindex]'
  );
  
  expect(focusableElements.length).toBeGreaterThan(0);
});
```

### **3. Performance Testing**
```typescript
it('meets performance benchmarks', async () => {
  const startTime = performance.now();
  
  render(<Component />);
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  expect(renderTime).toBeLessThan(100); // 100ms threshold
});
```

## Summary

The BizOS UI Guidelines establish **comprehensive standards** for UI development within the BizOS platform, ensuring:

✅ **Consistent Design**: Standardized components and visual patterns
✅ **Professional Quality**: Premium visual polish and finish
✅ **Accessibility Compliance**: WCAG 2.1 AA compliance for all components
✅ **Responsive Design**: Mobile-first approach with comprehensive desktop support
✅ **Theming System**: Flexible theming with consistent design tokens
✅ **Cross-Browser Support**: Consistent experience across modern browsers
✅ **Performance Optimized**: Performance-aware component design
✅ **Test Coverage**: Comprehensive testing strategy for all components

**Core Principles**:
- **User-Centered Design**: Design focused on user needs and accessibility
- **Consistent Experience**: Uniform experience across all platform components
- **Business Context**: UI design optimized for business use cases
- **Quality Assurance**: High standards for visual and functional quality
- **Continuous Improvement**: Ongoing refinement of UI standards and patterns

**This UI Guidelines system ensures that all BizOS components maintain high quality, consistency, and accessibility standards while providing a premium user experience for business applications.**
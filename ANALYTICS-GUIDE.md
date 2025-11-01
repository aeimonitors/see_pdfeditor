# Analytics Integration Guide

**Date:** October 31, 2025
**Status:** ✅ Implemented - Ready for Configuration

---

## 🎯 Overview

The See PDF Editor now includes comprehensive analytics tracking using Google Analytics 4 (GA4). This allows you to understand user behavior, track feature usage, and make data-driven decisions.

---

## 📊 What's Tracked

### User Actions
- **Page views** - When users visit the app
- **PDF uploads** - File size and page count
- **PDF exports** - Page count and duration
- **Image additions** - Image type and file size
- **Page operations** - Rotate, delete, reorder, duplicate
- **Theme changes** - Light/Dark mode switches
- **Feature usage** - Help modal, clear all, etc.
- **Errors** - Error type, message, and severity
- **Engagement time** - Time spent in the app

### Event Categories
- **PDF Operations** - Upload, export, merge
- **Page Operations** - Rotate, delete, reorder
- **Image Operations** - Add image to PDF
- **OCR** - Text extraction usage
- **UI** - Theme changes, modal opens
- **Features** - Feature usage tracking
- **Errors** - Error tracking and debugging
- **Engagement** - User engagement metrics
- **Lifecycle** - App initialization, crashes

---

## 🚀 Quick Setup

### Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Start measuring"
3. Create an account and property
4. Choose "Web" platform
5. Enter your website URL
6. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`)

### Step 2: Configure the App

Open `prototype/config.js` and update:

```javascript
analytics: {
  measurementId: 'G-XXXXXXXXXX', // Replace with your ID
  enableInDev: false,             // Set true to test in development
  trackPageViews: true,
  trackErrors: true,
  trackEngagement: true,
  anonymizeIp: true,
},
```

### Step 3: Enable Analytics

In `prototype/multi-pdf-app.js`, update line 8:

```javascript
// Before
const analytics = new Analytics(null);

// After
const analytics = new Analytics(AppConfig.analytics.measurementId);
```

### Step 4: Test

1. Start the dev server: `npm run dev`
2. Open browser console
3. Look for: `"Analytics initialized"`
4. Perform actions (upload PDF, export, etc.)
5. See events logged in console
6. Check GA4 dashboard (Real-time section)

---

## 📈 Available Analytics Methods

### Track Events

```javascript
// PDF operations
analytics.trackPDFUpload(fileSize, pageCount);
analytics.trackPDFExport(pageCount, duration);

// Image operations
analytics.trackImageAdd(imageType, fileSize);

// Page operations
analytics.trackPageOperation('rotate'); // 'rotate', 'delete', 'reorder', 'duplicate'

// OCR usage
analytics.trackOCRUsage(pageCount, success);

// Theme changes
analytics.trackThemeChange('dark'); // 'light' or 'dark'

// Feature usage
analytics.trackFeatureUsage('help_modal');

// Error tracking
analytics.trackError(errorType, errorMessage, fatal);

// Engagement tracking
analytics.trackEngagement(durationInSeconds);

// Custom events
analytics.trackEvent('custom_event', {
  param1: 'value1',
  param2: 'value2',
  category: 'Custom',
});
```

### Track Page Views

```javascript
analytics.trackPageView('/path', 'Page Title');
```

### Set User Properties

```javascript
analytics.setUserProperty('preferred_theme', 'dark');
analytics.setUserProperty('user_type', 'power_user');
```

---

## 🔒 Privacy Compliance

### Built-in Privacy Features

1. **IP Anonymization** - Enabled by default
   ```javascript
   anonymizeIp: true
   ```

2. **No Personal Data** - We don't track:
   - User names
   - Email addresses
   - File names
   - File contents
   - Personal information

3. **User Consent** - Consider adding a cookie consent banner
   ```html
   <!-- Example -->
   <div id="cookie-consent">
     We use cookies to improve your experience.
     <button onclick="acceptCookies()">Accept</button>
   </div>
   ```

4. **Opt-out Support** - Users can disable tracking via browser settings

### GDPR Compliance

To be GDPR compliant:
1. Add a privacy policy
2. Add cookie consent banner
3. Respect "Do Not Track" browser setting
4. Allow users to opt-out
5. Document data collection in privacy policy

---

## 📊 GA4 Dashboard Setup

### Recommended Reports

1. **Real-time**
   - Monitor live users
   - See events as they happen

2. **Engagement**
   - User engagement time
   - Pages per session
   - Event count

3. **Events**
   - All events with parameters
   - Conversion tracking
   - Custom events

4. **User Attributes**
   - User properties
   - Demographics (if enabled)

### Custom Dimensions

Create these in GA4:
- `file_size_mb` - PDF file sizes
- `page_count` - Number of pages
- `error_type` - Error categories
- `feature_name` - Feature usage
- `operation` - Page operations

### Goals & Conversions

Mark these events as conversions:
- `pdf_export` - Successful export
- `user_engagement` - Long engagement (>30s)

---

## 🧪 Testing Analytics

### Development Testing

```javascript
// Enable in development
const analytics = new Analytics('G-XXXXXXXXXX');

// Test events
analytics.trackEvent('test_event', {
  test_param: 'test_value',
  category: 'Testing',
});
```

### Console Logging

All events are logged to console:
```
Analytics event: pdf_upload { file_size_mb: "2.34", page_count: 15, category: "PDF Operations" }
```

### GA4 Debug View

1. Install [GA Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/) extension
2. Enable debug mode
3. See detailed event data

---

## 📉 Common Issues

### Analytics Not Tracking

**Issue:** Events not showing in GA4

**Solutions:**
1. Check Measurement ID is correct
2. Verify CSP allows Google Analytics domains
3. Check browser console for errors
4. Wait 24-48 hours for initial data
5. Use Real-time view for instant feedback

### CSP Blocking Scripts

**Issue:** Content Security Policy blocking GA

**Solution:** Ensure CSP includes:
```html
script-src https://www.googletagmanager.com https://www.google-analytics.com;
connect-src https://www.google-analytics.com https://analytics.google.com;
img-src https://www.google-analytics.com;
```

### Events Not in Real-time

**Issue:** Events delayed

**Explanation:** Some reports take 24-48 hours to populate. Use Real-time view for instant data.

---

## 🎯 Best Practices

### 1. Event Naming
- Use lowercase with underscores: `pdf_upload`
- Be consistent across the app
- Use descriptive names

### 2. Parameters
- Keep parameter names short
- Use consistent data types
- Include relevant context

### 3. Categories
- Group related events
- Use consistent category names
- Makes filtering easier

### 4. Testing
- Test all events before production
- Verify data accuracy
- Check Real-time view

### 5. Privacy
- Anonymize IPs
- Don't track personal data
- Respect user preferences

---

## 📝 Configuration Checklist

- [ ] Create GA4 account
- [ ] Get Measurement ID
- [ ] Update `config.js`
- [ ] Update `multi-pdf-app.js`
- [ ] Test in development
- [ ] Verify events in GA4 Real-time
- [ ] Add privacy policy
- [ ] Add cookie consent (optional)
- [ ] Deploy to production
- [ ] Monitor dashboard

---

## 🚀 Next Steps

1. **Set up GA4 account** - Get your Measurement ID
2. **Configure the app** - Update config files
3. **Test thoroughly** - Verify events are tracked
4. **Add consent banner** - Comply with privacy laws
5. **Monitor dashboard** - Track user behavior
6. **Iterate based on data** - Make data-driven decisions

---

## 📖 Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9322688)
- [GDPR Compliance Guide](https://support.google.com/analytics/answer/9019185)
- [GA Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/)

---

**Analytics is ready!** Just add your Measurement ID and start tracking. 📊

# Azure DevOps Work Items: Predictive Analytics & ML Forecasting
**Generated:** February 10, 2026 @ 6:05 AM EST  
**Source:** reports/SPRINT-RESEARCH-PREDICTIVE-ANALYTICS-SPENDING-FORECASTS-2026-02-10.md  
**Status:** Ready for Azure DevOps Creation

---

## Work Item 1: Time Series Utils Library

**Type:** Task  
**Priority:** High  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 2  
**Effort:** 4 hours  
**Tags:** ml, forecasting, technical-debt, utils

### Description
Create utility library for simple time series forecasting using moving averages, exponential smoothing, and linear trend extrapolation. No ML required — pure math-based forecasting.

### Acceptance Criteria
- [ ] `app/assets/js/time-series-utils.js` created
- [ ] Functions implemented:
  - `movingAverage(data, windowSize)` — Smooth spending data
  - `exponentialSmoothing(data, alpha)` — Weighted recent data
  - `linearTrend(data)` — Project linear growth/decline
- [ ] Unit tests: 90%+ accuracy on synthetic test data
- [ ] JSDoc documentation with usage examples
- [ ] Performance: < 1ms execution for 12-month dataset

### Implementation Notes
```javascript
// Moving Average (3-month window)
const monthlySpending = [4500, 3200, 5100, 4800, 2900, 5500];
const smoothed = movingAverage(monthlySpending, 3);
const nextMonthPrediction = smoothed[smoothed.length - 1]; // $4,400

// Exponential Smoothing (30% weight to recent data)
const smoothed2 = exponentialSmoothing(monthlySpending, 0.3);

// Linear Trend (extrapolate next month)
const nextMonth = linearTrend(monthlySpending); // $4,583
```

### Testing
- [ ] Test with known datasets (validate against expected results)
- [ ] Edge cases: Empty array, single data point, negative values
- [ ] Performance benchmark: < 1ms for 12 months

---

## Work Item 2: Budget Projection Dashboard Widget

**Type:** Feature  
**Priority:** High  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 2  
**Effort:** 4 hours  
**Tags:** ml, dashboard, budget, ui

### Description
Add "Budget Projections" widget to dashboard showing predicted end-of-month spending per category using time series forecasting. Alerts user if projected to overspend.

### Acceptance Criteria
- [ ] Widget displays on dashboard (`dashboard.html`)
- [ ] Query last 3 months of spending per category from Supabase
- [ ] Calculate projected spending using `linearTrend()` from time-series-utils
- [ ] Visual elements:
  - Progress bar (current / budget)
  - Projected amount with confidence level
  - Color: Green (on track), Yellow (warning), Red (overbudget)
  - Alert badge if projected > budget
- [ ] Tooltip: "Based on last 3 months, you'll likely spend $X this month"
- [ ] Mobile responsive (stacks on small screens)
- [ ] Performance: Widget renders in < 200ms

### Supabase Query
```sql
-- Get spending per category for last 3 months
SELECT 
  category, 
  DATE_TRUNC('month', date) as month,
  SUM(ABS(amount)) as total_spend
FROM transactions
WHERE user_id = ? 
  AND date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')
  AND amount < 0
GROUP BY category, month
ORDER BY month ASC
```

### UI Mockup
```html
<div class="card mb-4">
  <div class="card-header">
    <h5>📊 Budget Projections <span class="badge bg-info">AI</span></h5>
  </div>
  <div class="card-body">
    <!-- Food Category -->
    <div class="mb-3">
      <div class="d-flex justify-content-between">
        <span>Food</span>
        <span>$520 / $800</span>
      </div>
      <div class="progress" style="height: 20px;">
        <div class="progress-bar bg-warning" style="width: 65%;">65%</div>
      </div>
      <small class="text-warning">⚠️ Projected: $1,040 (30% over)</small>
    </div>
  </div>
</div>
```

### Testing
- [ ] Widget displays with real user data
- [ ] Predictions within 20% of actual spending (validate after 30 days)
- [ ] Responsive on mobile (320px width)
- [ ] Performance: < 200ms render time

---

## Work Item 3: TensorFlow.js Linear Regression Model

**Type:** Task  
**Priority:** High  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 2  
**Effort:** 6 hours  
**Tags:** ml, tensorflow, forecasting, technical-debt

### Description
Implement TensorFlow.js-based linear regression model for budget forecasting. Provides more accurate predictions than simple time series by learning from user's spending patterns.

### Acceptance Criteria
- [ ] TensorFlow.js v4 imported via ESM CDN
- [ ] `app/assets/js/ml-budget-forecast.js` created
- [ ] `BudgetForecaster` class implemented:
  - `buildModel()` — Create linear regression model
  - `train(historicalData)` — Train on user's spending data
  - `predict(currentDay)` — Predict end-of-month spending
- [ ] Model persists to IndexedDB (no retraining on page refresh)
- [ ] Performance:
  - Training: < 2 seconds for 3 months of data
  - Inference: < 100ms per prediction
- [ ] Accuracy: 80%+ (measure against actual spending after 30 days)

### Implementation Notes
```javascript
import * as tf from 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4/+esm';

class BudgetForecaster {
  async buildModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [1], units: 1 })
      ]
    });
    this.model.compile({
      optimizer: tf.train.adam(0.1),
      loss: 'meanSquaredError'
    });
  }

  async train(historicalData) {
    // historicalData: [{ day: 5, cumulativeSpend: 200 }, ...]
    const xs = tf.tensor2d(historicalData.map(d => [d.day]));
    const ys = tf.tensor2d(historicalData.map(d => [d.cumulativeSpend]));
    await this.model.fit(xs, ys, { epochs: 100 });
  }

  predict(currentDay) {
    const input = tf.tensor2d([[30]]); // Day 30 (end of month)
    const prediction = this.model.predict(input);
    return prediction.dataSync()[0];
  }
}
```

### Testing
- [ ] Model trains without errors
- [ ] Predictions are reasonable (within 10-50% of actual)
- [ ] Performance benchmarks met
- [ ] Memory cleanup (no tensor leaks)
- [ ] Works offline (model cached in IndexedDB)

---

## Work Item 4: Budget Overrun Alert System

**Type:** Feature  
**Priority:** High  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 2  
**Effort:** 6 hours  
**Tags:** ml, alerts, notifications, budget

### Description
Proactive alert system that warns users 3-7 days before projected budget overruns. Uses ML predictions to calculate spending velocity and flag categories at risk.

### Acceptance Criteria
- [ ] Create `alerts` table in Supabase (see schema below)
- [ ] Alert generation logic:
  - Calculate current spending velocity ($/day)
  - Project end-of-month spending using ML model
  - If projection > budget: Create alert
  - Trigger 3-7 days before month-end (if not already alerted)
- [ ] Alert display:
  - Banner on dashboard (dismissible)
  - Push notification (if PWA enabled)
  - Badge on sidebar (unread count)
- [ ] User actions:
  - Dismiss alert
  - Snooze for 24 hours
  - View detailed breakdown
- [ ] Performance: Alert generated within 5 seconds of page load

### Database Schema
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  alert_type TEXT NOT NULL, -- 'overspend_warning', 'fraud_alert', etc.
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT, -- 'Food', 'Transport', NULL for general alerts
  projected_amount DECIMAL(10,2),
  budget_amount DECIMAL(10,2),
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  snoozed_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_unread ON alerts(user_id, is_read);
```

### Alert Logic
```javascript
// Calculate spending velocity
const daysElapsed = new Date().getDate();
const currentSpend = 520; // From transactions
const budget = 800;

const forecaster = new BudgetForecaster();
await forecaster.train(historicalData);
const projectedSpend = forecaster.predict(daysElapsed);

if (projectedSpend > budget) {
  const overage = projectedSpend - budget;
  const daysRemaining = 30 - daysElapsed;
  
  if (daysRemaining >= 3 && daysRemaining <= 7) {
    await supabase.from('alerts').insert({
      user_id: userId,
      alert_type: 'overspend_warning',
      severity: 'warning',
      title: 'Budget Overrun Warning',
      message: `You're projected to overspend by $${overage.toFixed(2)} on Food this month.`,
      category: 'Food',
      projected_amount: projectedSpend,
      budget_amount: budget
    });
  }
}
```

### UI Components
```html
<!-- Alert Banner (dashboard.html) -->
<div class="alert alert-warning alert-dismissible fade show" role="alert">
  <strong>⚠️ Budget Alert:</strong> You're projected to overspend by $240 on Food this month.
  <a href="#" class="alert-link">View Breakdown</a>
  <button type="button" class="btn-close" onclick="dismissAlert()"></button>
</div>
```

### Testing
- [ ] Alerts generated correctly for users projected to overspend
- [ ] No duplicate alerts (one per category per month)
- [ ] Alerts dismissed/snoozed correctly
- [ ] Push notifications work (if PWA installed)
- [ ] Performance: < 5s to generate alerts on dashboard load

---

## Work Item 5: LSTM Time Series Forecasting

**Type:** Task  
**Priority:** Medium  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 3  
**Effort:** 6 hours  
**Tags:** ml, tensorflow, lstm, advanced

### Description
Implement LSTM (Long Short-Term Memory) deep learning model for advanced time series forecasting. Captures seasonal patterns, holidays, and complex spending behaviors that linear regression misses.

### Acceptance Criteria
- [ ] `app/assets/js/ml-lstm-forecast.js` created
- [ ] `LSTMForecaster` class implemented:
  - `buildModel()` — Create LSTM architecture (2 layers, dropout)
  - `prepareData()` — Convert time series to sequences
  - `train(monthlySpending)` — Train on 12+ months of data
  - `predict(recentMonths)` — Forecast next month's spending
- [ ] Only activates if user has 12+ months of data (graceful fallback to linear regression)
- [ ] Performance:
  - Training: < 30 seconds for 12 months of data
  - Inference: < 200ms per prediction
- [ ] Accuracy: 85%+ for users with seasonal patterns
- [ ] Model persists to IndexedDB (retrains monthly)

### LSTM Architecture
```javascript
this.model = tf.sequential({
  layers: [
    tf.layers.lstm({
      units: 50,
      returnSequences: true,
      inputShape: [6, 1] // Last 6 months
    }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.lstm({ units: 50, returnSequences: false }),
    tf.layers.dropout({ rate: 0.2 }),
    tf.layers.dense({ units: 1 })
  ]
});
```

### Use Cases
- Seasonal spending (holiday shopping, summer vacation)
- Income volatility (freelancers, commission-based)
- Lifestyle changes (new baby, moved cities)

### Testing
- [ ] LSTM model trains without errors
- [ ] Predictions outperform linear regression by 10%+ for seasonal data
- [ ] Performance benchmarks met
- [ ] Fallback to linear regression if insufficient data

---

## Work Item 6: Anomaly Detection & Fraud Alerts

**Type:** Feature  
**Priority:** Medium  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 3  
**Effort:** 5 hours  
**Tags:** ml, fraud, security, anomaly-detection

### Description
Real-time anomaly detection system that flags unusual transactions (amount, location, time) and alerts user within 1 minute of suspicious activity. Uses ML to learn user's spending baseline.

### Acceptance Criteria
- [ ] Build user spending baseline:
  - Average transaction amount per category
  - Common locations (city, state)
  - Typical purchase times (morning, afternoon, evening)
  - Frequent merchants
- [ ] Anomaly scoring algorithm:
  - Score 0.0-1.0 (0 = normal, 1 = highly suspicious)
  - Threshold: 0.85 (trigger alert)
- [ ] Real-time detection:
  - Supabase Realtime subscription on `transactions` table
  - Analyze new transaction within 10 seconds
  - Create alert if anomaly score > 0.85
- [ ] User confirmation:
  - "Was this you?" (Yes / No / Report Fraud)
  - If "No": Flag for review, suggest freezing card
- [ ] Performance: < 1 minute from transaction to alert

### Anomaly Scoring
```javascript
function calculateAnomalyScore(transaction, userProfile) {
  let score = 0;
  
  // Amount anomaly (10x average)
  if (transaction.amount > userProfile.avgAmount * 10) {
    score += 0.4;
  }
  
  // Location anomaly (never been there)
  if (!userProfile.commonLocations.includes(transaction.location)) {
    score += 0.3;
  }
  
  // Time anomaly (unusual hour)
  const hour = new Date(transaction.time).getHours();
  if (hour < 6 || hour > 23) {
    score += 0.2;
  }
  
  // Category anomaly (rarely purchase this)
  if (!userProfile.frequentCategories.includes(transaction.category)) {
    score += 0.1;
  }
  
  return score; // 0.0-1.0
}
```

### Testing
- [ ] True positive rate: 90%+ (catches actual fraud)
- [ ] False positive rate: < 10% (doesn't annoy with false alarms)
- [ ] Real-time detection: < 1 minute
- [ ] User can confirm/deny suspicious transactions

---

## Work Item 7: Subscription Optimizer

**Type:** Feature  
**Priority:** Low  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 3  
**Effort:** 4 hours  
**Tags:** ml, subscriptions, optimization, savings

### Description
Identify duplicate or wasteful subscriptions by clustering recurring transactions and flagging overlaps. Recommends consolidation or cancellation to save money.

### Acceptance Criteria
- [ ] Identify recurring transactions:
  - Monthly charges (same amount, same merchant, 28-31 day intervals)
  - Categorize as "subscriptions"
- [ ] Cluster similar subscriptions:
  - Use Levenshtein distance to find similar names
  - Threshold: 70% similarity (e.g., "Spotify Premium" + "Spotify Family")
- [ ] Generate recommendations:
  - Duplicate subscriptions (cancel one)
  - Similar services (consolidate, e.g., Hulu + Netflix → Disney+ Bundle)
  - Unused subscriptions (no logins in 60 days — requires future integration)
- [ ] Report widget on dashboard:
  - Total monthly waste identified
  - List of duplicate/similar subscriptions
  - Action buttons: "Remind me to cancel" / "Ignore"

### Clustering Algorithm
```javascript
function findDuplicateSubscriptions(subscriptions) {
  const duplicates = [];
  
  for (let i = 0; i < subscriptions.length; i++) {
    for (let j = i + 1; j < subscriptions.length; j++) {
      const similarity = stringSimilarity(
        subscriptions[i].name, 
        subscriptions[j].name
      );
      
      if (similarity > 0.7) {
        duplicates.push({
          sub1: subscriptions[i],
          sub2: subscriptions[j],
          similarity: similarity,
          monthlyWaste: Math.min(subscriptions[i].amount, subscriptions[j].amount)
        });
      }
    }
  }
  
  return duplicates;
}
```

### Report Widget
```html
<div class="card mb-4">
  <div class="card-header bg-warning text-dark">
    <h5>💰 Subscription Optimizer</h5>
  </div>
  <div class="card-body">
    <h4 class="text-danger">$127/month waste identified</h4>
    <ul>
      <li>Spotify Premium + Spotify Family — $27.98/month overlap</li>
      <li>Netflix + Hulu + Disney+ — Consider bundle ($13/month savings)</li>
      <li>Unused gym membership — No visits in 60 days ($50/month)</li>
    </ul>
    <button class="btn btn-primary">Review Subscriptions</button>
  </div>
</div>
```

### Testing
- [ ] Identifies 90%+ of duplicate subscriptions
- [ ] Recommendations are accurate (not false positives)
- [ ] Users save $50+ monthly on average

---

## Work Item 8: Model Retraining Pipeline

**Type:** Task  
**Priority:** Low  
**Area Path:** Fireside Capital\Backend  
**Iteration:** Sprint 4  
**Effort:** 3 hours  
**Tags:** ml, automation, devops

### Description
Automated pipeline to retrain ML models weekly using latest user data. Tracks prediction accuracy over time and auto-adjusts hyperparameters to improve performance.

### Acceptance Criteria
- [ ] Service Worker background task: Weekly model retraining
- [ ] Track prediction accuracy:
  - Compare predicted vs. actual spending (after month ends)
  - Calculate Mean Absolute Percentage Error (MAPE)
  - Store in `ml_metrics` table
- [ ] Auto-adjust hyperparameters:
  - If accuracy < 80%: Increase model complexity (more layers)
  - If accuracy > 95%: Reduce complexity (prevent overfitting)
- [ ] Dashboard: ML performance metrics widget
  - Accuracy trend chart (last 6 months)
  - Current model version
  - Last retrained date

### Accuracy Tracking
```javascript
async function trackPredictionAccuracy() {
  const { data: predictions } = await supabase
    .from('predictions')
    .select('*')
    .gte('prediction_date', lastMonth)
    .not('actual_amount', 'is', null);

  const mape = predictions.reduce((sum, pred) => {
    const error = Math.abs((pred.predicted_amount - pred.actual_amount) / pred.actual_amount);
    return sum + error;
  }, 0) / predictions.length;

  const accuracy = (1 - mape) * 100;
  
  await supabase.from('ml_metrics').insert({
    metric_type: 'prediction_accuracy',
    value: accuracy,
    measured_at: new Date().toISOString()
  });

  return accuracy;
}
```

### Testing
- [ ] Retraining runs weekly without errors
- [ ] Accuracy improves over time
- [ ] Performance metrics display correctly

---

## Work Item 9: User Feedback Loop

**Type:** Feature  
**Priority:** Low  
**Area Path:** Fireside Capital\Frontend  
**Iteration:** Sprint 4  
**Effort:** 2 hours  
**Tags:** ml, feedback, ux

### Description
Collect user feedback on prediction accuracy to improve ML models. Simple thumbs up/down UI for each prediction, with optional comments.

### Acceptance Criteria
- [ ] "Was this prediction helpful?" UI on dashboard
- [ ] Thumbs up/down buttons
- [ ] Optional text feedback (modal)
- [ ] Log feedback to `prediction_feedback` table
- [ ] Aggregate feedback displayed on Insights page
  - "85% of users found predictions helpful"
- [ ] A/B test different forecasting methods (linear vs. LSTM)
  - Show LSTM to 50% of users
  - Compare accuracy & user satisfaction

### UI Component
```html
<div class="card mb-4">
  <div class="card-body">
    <p>📊 Predicted: You'll spend $1,040 on Food this month</p>
    <p class="text-muted">Was this prediction helpful?</p>
    <div class="btn-group" role="group">
      <button class="btn btn-sm btn-success" onclick="ratePrediction('helpful')">
        👍 Yes
      </button>
      <button class="btn btn-sm btn-danger" onclick="ratePrediction('not-helpful')">
        👎 No
      </button>
    </div>
  </div>
</div>
```

### Testing
- [ ] Feedback captured correctly
- [ ] Aggregate metrics display
- [ ] A/B test identifies better model

---

## Summary

**Total Work Items:** 9  
**Total Effort:** 40 hours  
**Sprint Distribution:**
- Sprint 2 (High Priority): 4 items, 20 hours
- Sprint 3 (Medium): 3 items, 15 hours
- Sprint 4 (Low): 2 items, 5 hours

**Dependencies:**
1. Work Item 1 (Time Series Utils) must be completed before Work Item 2
2. Work Item 3 (TensorFlow.js) can run parallel to Work Items 1-2
3. Work Item 4 (Alerts) depends on Work Item 3
4. Work Items 5-9 are independent (can be prioritized based on user feedback)

**Recommended Implementation Order:**
1. Time Series Utils (4h) — Foundation
2. Budget Projection Widget (4h) — User-visible quick win
3. TensorFlow.js Linear Regression (6h) — Real ML
4. Budget Overrun Alerts (6h) — High user impact
5. LSTM Forecasting (6h) — Advanced features
6. Anomaly Detection (5h) — Security
7. Subscription Optimizer (4h) — Savings discovery
8. Model Retraining (3h) — Automation
9. User Feedback (2h) — Continuous improvement

**Quick Win Path (8 hours):**
1. Time Series Utils (4h)
2. Budget Projection Widget (4h)
3. Deploy → Users see predictions immediately

**Full ML Path (20 hours):**
1-4 above (20h total) → Complete ML forecasting + alerts

---

**Document Status:** ✅ Ready for Azure DevOps Import  
**Related Research:** reports/SPRINT-RESEARCH-PREDICTIVE-ANALYTICS-SPENDING-FORECASTS-2026-02-10.md  
**Created By:** Capital (Sprint Research Agent)  
**Date:** February 10, 2026 @ 6:05 AM EST

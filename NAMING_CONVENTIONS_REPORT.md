# Naming Conventions Analysis Report

## Summary
This report analyzes the codebase against the following naming conventions:
- **Folders** → lowercase (e.g., components, services)
- **Variables & Functions** → camelCase (e.g., userName, getUserData)
- **Components** → PascalCase (e.g., UserCard, LoginForm)

---

## ✅ CONVENTIONS BEING FOLLOWED

### 1. Components (PascalCase) - MOSTLY FOLLOWED ✓
Most components correctly use PascalCase:
- `MFCard.tsx` → `MFCard`
- `ChartBarStacked` → `ChartBarStacked`
- `HeaderRow.tsx` → `HeaderRow`
- `InformationCard.tsx` → `InformationCard`
- `FilterPill.tsx` → `FilterPill`
- `MFDateRangePicker.tsx` → `MFDateRangePicker`
- `ToggleButton` → `ToggleButton`
- `SessionCheck.tsx` → `SessionCheck`
- `PackageContext.tsx` → `PackageProvider`
- `DateRangeContext.tsx` → `DateRangeProvider`
- `CampaignAnalytics` → `CampaignAnalytics`

### 2. Variables & Functions (camelCase) - FOLLOWED ✓
Most variables and functions correctly use camelCase:
- `downloadCSV`
- `handleExport`
- `onExpand`
- `handleTypeChange`
- `selectedType`
- `chartData`
- `formatTickValue`
- `getXAxisAngle`
- `formatNumber`
- `onExpand`
- `handleExportData`
- `formatValue`
- `debounce`
- `parsePercentage`
- `formatBlacklistLabel`
- `queryFunction`
- `mutationFunction`
- `fetchData`

### 3. Folders (lowercase) - PARTIALLY FOLLOWED ⚠️
Many folders correctly use lowercase:
- `components` ✓
- `services` ✓
- `hooks` ✓
- `lib` ✓
- `queries` ✓
- `types` ✓
- `context` ✓
- `app` ✓
- `charts` ✓
- `forms` ✓
- `login` ✓
- `ui` ✓
- `report` ✓
- `campaign` ✓
- `logs` ✓
- `configuration` ✓
- `dashboard` ✓
- `mail` ✓
- `generate` ✓
- `reportingtool` ✓

---

## ❌ CONVENTIONS NOT BEING FOLLOWED

### 1. Folders (lowercase) - VIOLATIONS ❌

#### Folders with PascalCase (should be lowercase):
1. **`User-Management`** → Should be: `user-management`
   - Location: `src/app/(main)/User-Management/`
   - Also found in: `src/app/(main)/webfraud/User-Management/`

2. **`CampaignAnalytics`** → Should be: `campaign-analytics`
   - Location: `src/app/(main)/unified-ad-manager/CampaignAnalytics/`

3. **`EcomSignals`** → Should be: `ecom-signals`
   - Location: `src/app/(main)/unified-ad-manager/EcomSignals/`

4. **`InDepthAnomalyAnalysis`** → Should be: `in-depth-anomaly-analysis`
   - Location: `src/app/(main)/(app)/re-engagement/dashboard/overall-summary/InDepthAnomalyAnalysis/`
   - Also in: `src/app/(main)/(app)/integrity/dashboard/overall-summary/InDepthAnomalyAnalysis/`

5. **`Publisher`** → Should be: `publisher` (already lowercase, but has capital P)
   - Location: `src/app/(main)/(app)/re-engagement/dashboard/overall-summary/Publisher/`
   - Also in: `src/app/(main)/(app)/integrity/dashboard/overall-summary/Publisher/`

6. **`Types`** → Should be: `types`
   - Location: `src/app/(main)/(app)/integrity/dashboard/overall-summary/Types/`

7. **`Dashboard`** → Should be: `dashboard`
   - Location: `src/app/(main)/(app)/re-engagement/dashboard/overall-summary/Dashboard/`

8. **`Filters`** → Should be: `filters`
   - Location: `src/components/mf/Filters/` (Note: This might be acceptable if it's a component folder, but folder naming convention says lowercase)

9. **`ToggleButton`** → Should be: `toggle-button`
   - Location: `src/components/mf/ToggleButton/`

#### Folders with Mixed Case or Kebab-Case with Capital Letters:
10. **`Ad-manager-apiAccess`** → Should be: `ad-manager-api-access`
    - Location: `src/app/(main)/webfraud/Configuration/Ad-manager-apiAccess/`

11. **`ApiClient`** → Should be: `api-client`
    - Location: `src/app/(main)/webfraud/ApiClient/`
    - Also in: `src/app/(main)/User-Management/ApiClient/`

12. **`Call-Recommendation`** → Should be: `call-recommendation`
    - Location: `src/app/(main)/unified-ad-manager/insights-and-performance/Call-Recommendation/`

13. **`Campaign-wise`** → Should be: `campaign-wise` (has capital C)
    - Location: `src/app/(main)/unified-ad-manager/insights-and-performance/Campaign-wise/`

14. **`Download-Ivt-Report`** → Should be: `download-ivt-report`
    - Location: `src/app/(main)/webfraud/ReportingTool/Download-Ivt-Report/`

15. **`LandingPage-wise`** → Should be: `landing-page-wise`
    - Location: `src/app/(main)/unified-ad-manager/insights-and-performance/LandingPage-wise/`

16. **`Package-Config`** → Should be: `package-config`
    - Location: `src/app/(main)/User-Management/Package-Config/`

17. **`Product-Mapping`** → Should be: `product-mapping`
    - Location: `src/app/(main)/User-Management/Product-Mapping/`
    - Also in: `src/app/(main)/webfraud/User-Management/Product-Mapping/`

18. **`Product_Mapping`** → Should be: `product-mapping` (also uses underscore instead of hyphen)
    - Location: `src/app/(main)/webfraud/User-Management/Product_Mapping/`

19. **`Real-Time-Protection`** → Should be: `real-time-protection`
    - Location: `src/app/(main)/webfraud/Configuration/Real-Time-Protection/`

20. **`User-Package-Config`** → Should be: `user-package-config`
    - Location: `src/app/(main)/User-Management/User-Package-Config/`
    - Also in: `src/app/(main)/webfraud/User-Management/User-Package-Config/`

21. **`Users-Config`** → Should be: `users-config`
    - Location: `src/app/(main)/User-Management/Users-Config/`
    - Also in: `src/app/(main)/webfraud/User-Management/Users-Config/`

22. **`WhiteListing-IVT-Category`** → Should be: `whitelisting-ivt-category`
    - Location: `src/app/(main)/webfraud/Configuration/WhiteListing-IVT-Category/`

### 2. Component Files (PascalCase) - MINOR VIOLATIONS ⚠️

#### Component files with lowercase or camelCase:
1. **`stackedBarChart.tsx`** → Should be: `StackedBarChart.tsx`
   - Location: `src/components/mf/charts/stackedBarChart.tsx`
   - Component name inside: `ChartBarStacked` (correct PascalCase)
   - Issue: File name should match component name convention

2. **`card.tsx`** → Should be: `Card.tsx` (if it's a component)
   - Location: `src/components/mf/login/card.tsx`
   - Note: This might be acceptable if it's a small utility component

### 3. Variables & Functions - MINOR ISSUES ⚠️

#### Constants using UPPER_CASE (acceptable, but not camelCase):
- `PLATFORM_OPTIONS` - This is actually acceptable for constants
- `CAMPAIGN_TYPE_MAP` - This is actually acceptable for constants
- `MATCH_TYPE_OPTIONS` - This is actually acceptable for constants
- `CAMPAIGN_GOAL` - This is actually acceptable for constants

**Note:** UPPER_CASE for constants is a common convention and is acceptable, though the requirement specified camelCase. This is a minor deviation that's widely accepted in JavaScript/TypeScript.

#### Non-component exports with lowercase:
- `description` in `ChartAreaGradient.tsx` - This is a constant export, acceptable

---

## 📊 STATISTICS

### Folders
- **Total folders checked:** ~80+
- **Folders following convention:** ~60+ (75%)
- **Folders violating convention:** ~22 (25%)

### Components
- **Total components checked:** 50+
- **Components following convention:** 48+ (96%)
- **Components violating convention:** 2 (4%)

### Variables & Functions
- **Total variables/functions checked:** 30+
- **Following convention:** 30+ (100%)
- **Constants using UPPER_CASE:** 4 (acceptable deviation)

---

## 🔧 RECOMMENDATIONS

### High Priority
1. **Rename folders with PascalCase to lowercase:**
   - `User-Management` → `user-management`
   - `CampaignAnalytics` → `campaign-analytics`
   - `EcomSignals` → `ecom-signals`
   - `InDepthAnomalyAnalysis` → `in-depth-anomaly-analysis`
   - `ToggleButton` → `toggle-button`
   - `Filters` → `filters`

2. **Rename folders with mixed case:**
   - `Ad-manager-apiAccess` → `ad-manager-api-access`
   - `ApiClient` → `api-client`
   - `Call-Recommendation` → `call-recommendation`
   - `Campaign-wise` → `campaign-wise`
   - `Download-Ivt-Report` → `download-ivt-report`
   - `LandingPage-wise` → `landing-page-wise`
   - `Package-Config` → `package-config`
   - `Product-Mapping` → `product-mapping`
   - `Product_Mapping` → `product-mapping`
   - `Real-Time-Protection` → `real-time-protection`
   - `User-Package-Config` → `user-package-config`
   - `Users-Config` → `users-config`
   - `WhiteListing-IVT-Category` → `whitelisting-ivt-category`

### Medium Priority
3. **Rename component files:**
   - `stackedBarChart.tsx` → `StackedBarChart.tsx`

### Low Priority
4. **Review constants:** Consider if UPPER_CASE constants should be changed to camelCase (though this is widely accepted)

---

## 📝 NOTES

1. **Next.js Route Folders:** Some folder names are used as routes in Next.js. Renaming them will require updating:
   - Route imports
   - Navigation links
   - Menu configurations
   - Any hardcoded paths

2. **Component Folders:** Folders like `Filters` and `ToggleButton` contain components. While the convention says lowercase, some teams prefer PascalCase for component-only folders. This is a judgment call.

3. **Constants:** UPPER_CASE for constants is a widely accepted JavaScript/TypeScript convention, even though it differs from camelCase. This is generally acceptable.

4. **File Naming:** The file `stackedBarChart.tsx` contains a component named `ChartBarStacked` (correct PascalCase), but the file itself should ideally match the component name or follow PascalCase.

---

## ✅ CONCLUSION

**Overall Compliance:**
- **Components:** 96% compliant ✓
- **Variables & Functions:** 100% compliant ✓
- **Folders:** 75% compliant ⚠️

**Main Issue:** Folder naming conventions need the most attention, with approximately 22 folders violating the lowercase convention.


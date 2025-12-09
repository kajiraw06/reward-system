# Backend Validation & Error Handling Improvements

## 🎯 Overview
We've implemented comprehensive validation and standardized error handling across all API endpoints.

## ✨ What's New

### 1. **Validation Utilities** (`lib/validation.ts`)
Reusable validation functions for common use cases:

- **Phone Number Validation**: Philippine format (09171234567, +639171234567)
- **Username Validation**: 3-20 characters, alphanumeric + underscores
- **Email Validation**: Standard email format
- **URL Validation**: Valid URL format for image uploads
- **UUID Validation**: Proper UUID v4 format for database IDs
- **Number Range Validation**: Min/max boundaries with integer checks
- **String Length Validation**: Min/max character limits
- **Enum Validation**: Restricted value sets (statuses, categories)

### 2. **Structured Input Validators**
- `validateRewardInput()`: Complete reward creation/update validation
- `validateClaimInput()`: User claim submission validation
- `validateClaimStatus()`: Status transition validation
- `validateFileUpload()`: File type and size validation

### 3. **Standardized API Responses** (`lib/apiResponse.ts`)
Consistent response format across all endpoints:

```typescript
// Success Response
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}

// Error Response
{
  "success": false,
  "error": "Human-readable error message"
}
```

### 4. **Response Helpers**
- `successResponse()`: 200/201 success responses
- `errorResponse()`: Generic error response
- `validationErrorResponse()`: 400 validation errors
- `notFoundResponse()`: 404 not found
- `unauthorizedResponse()`: 401 unauthorized
- `forbiddenResponse()`: 403 forbidden
- `conflictResponse()`: 409 conflict (duplicates)
- `serverErrorResponse()`: 500 internal errors

## 🔧 Updated Endpoints

### `/api/claims` (POST)
**New Validations:**
- ✅ Username must be 3-20 characters, alphanumeric + underscores
- ✅ Phone number must be valid Philippine format
- ✅ Full name must be 3-255 characters
- ✅ Either delivery address OR e-wallet account required
- ✅ Delivery address must be 10-500 characters
- ✅ Reward existence and stock validation
- ✅ Variant existence validation

**Better Error Messages:**
- "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
- "Invalid phone number format. Please use Philippine mobile format (e.g., 09171234567)"
- "Sorry, 'iPhone 15 Pro' is currently out of stock"
- "Variant 'Black' not found for this reward"

### `/api/claims` (GET)
**New Validations:**
- ✅ Claim ID format validation (5-50 characters)

**Better Error Messages:**
- "Claim not found. Please check your claim ID and try again."

### `/api/admin/claims` (GET)
**New Validations:**
- ✅ Status filter validation (must be valid status)

### `/api/admin/claims` (PATCH)
**New Validations:**
- ✅ Claim ID format validation
- ✅ Status value validation
- ✅ Rejection reason required when rejecting (max 500 chars)
- ✅ Prevent double-approval of claims
- ✅ Stock validation before approval

**Better Error Messages:**
- "Rejection reason is required when rejecting a claim"
- "This claim has already been approved"
- "Claim status updated to approved successfully"

### `/api/admin/rewards` (GET, POST, PATCH, DELETE)
**New Validations:**
- ✅ Reward name: 3-255 characters
- ✅ Points: 1-1,000,000, integer only
- ✅ Quantity: 0-10,000, integer only
- ✅ Category: Must be valid category (Gadget, E-Wallet, Vehicle, etc.)
- ✅ UUID format validation for IDs
- ✅ Duplicate name detection
- ✅ Existence checks before update/delete
- ✅ Gallery URL validation

**Better Error Messages:**
- "Reward ID is required"
- "Invalid Reward ID format"
- "A reward with the name 'iPhone 15 Pro' already exists"
- "Reward not found"
- "Cannot delete reward. There are 5 claim(s) associated with this reward."
- "Reward 'iPhone 15 Pro' deleted successfully"

### `/api/upload` (POST)
**New Validations:**
- ✅ File presence validation
- ✅ File type validation (JPEG, PNG, GIF, WebP only)
- ✅ File size validation (max 5MB)

**Better Error Messages:**
- "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
- "File size too large. Maximum size is 5MB."
- "File uploaded successfully"

## 📊 Benefits

### 1. **Security**
- Prevents injection attacks through input sanitization
- Validates data types and ranges
- UUID format validation prevents SQL injection

### 2. **User Experience**
- Clear, actionable error messages
- Consistent response format
- Field-specific validation errors

### 3. **Data Integrity**
- Prevents invalid data from entering database
- Enforces business rules (stock checks, duplicate prevention)
- Catches edge cases (double-approval, missing variants)

### 4. **Developer Experience**
- Reusable validation functions
- Type-safe validation with TypeScript
- Centralized error handling
- Easy to extend and maintain

### 5. **API Consistency**
- All endpoints follow same response structure
- Predictable error codes (400, 404, 409, 500)
- Standardized success/error messages

## 🧪 Testing

Run the validation test suite:

```bash
npx ts-node tmp_rovodev_test_validation.ts
```

## 📝 Example Usage

### Frontend Integration

```typescript
// Before (inconsistent error handling)
const response = await fetch('/api/claims', {
  method: 'POST',
  body: JSON.stringify(data)
})
const result = await response.json()
if (result.error) {
  // Error could be in different formats
  alert(result.error)
}

// After (consistent error handling)
const response = await fetch('/api/claims', {
  method: 'POST',
  body: JSON.stringify(data)
})
const result = await response.json()
if (!result.success) {
  // Always has .success and .error
  alert(result.error) // Clear, actionable message
} else {
  // Always has .success and .data
  alert(result.message) // Optional success message
  console.log(result.data)
}
```

### Adding New Validation

```typescript
// In your API route
import { validateClaimInput } from '@/lib/validation'
import { validationErrorResponse, successResponse } from '@/lib/apiResponse'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate input (throws ValidationError if invalid)
    const validatedData = validateClaimInput(body)
    
    // Use validated data
    const result = await processData(validatedData)
    
    return successResponse(result, 'Operation completed successfully')
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return validationErrorResponse(error.message)
    }
    return serverErrorResponse(error)
  }
}
```

## 🔄 Migration Notes

### Breaking Changes
- None! All changes are backwards compatible.
- Response format now includes `success` field but old code will still work.

### Recommended Updates
1. Update frontend to check `result.success` instead of `result.error`
2. Display `result.message` on success for better UX
3. Handle specific HTTP status codes (400, 404, 409) for better error handling

## 🚀 Next Steps

Possible future enhancements:
1. Add rate limiting to prevent abuse
2. Add request logging for audit trails
3. Add API documentation (Swagger/OpenAPI)
4. Add unit tests for validation functions
5. Add authentication/authorization middleware
6. Add webhook notifications for claim updates
7. Add bulk operation validations

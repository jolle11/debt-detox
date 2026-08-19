# PocketBase Schema Configuration

## Collections to Create

### 1. `debts` Collection

**Fields:**

- `user_id` (Relation to `users`) - Required, Max select: 1
- `name` (Text) - Required
- `entity` (Text) - Required
- `down_payment` (Number) - Optional (Entrada/pago inicial)
- `first_payment_date` (Date) - Required (Fecha de la primera cuota)
- `monthly_amount` (Number) - Required (Importe mensual)
- `number_of_payments` (Number) - Required (Número de cuotas)
- `final_payment` (Number) - Optional (Importe de la última cuota)
- `final_payment_date` (Date) - Required (Fecha de la última cuota)
- `product_image` (File) - Optional, Max select: 1
- `deleted` (Date) - Optional (for soft deletes)

**API Rules:**

- List/Search: `deleted = null && ((@request.auth.id != "" && user_id = @request.auth.id) || (@request.headers.x_share_token != "" && @collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= id) || (@request.headers.x_share_token != "" && @collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= user_id))`
- View: `deleted = null && ((@request.auth.id != "" && user_id = @request.auth.id) || (@request.headers.x_share_token != "" && @collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= id) || (@request.headers.x_share_token != "" && @collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= user_id))`
- Create: `@request.auth != null`
- Update: `@request.auth != null`
- Delete: `@request.auth != null`

### 2. `payments` Collection

**Fields:**

- `debt_id` (Relation to `debts`) - Required, Max select: 1
- `month` (Number) - Required (1-12)
- `year` (Number) - Required
- `planned_amount` (Number) - Required
- `actual_amount` (Number) - Optional
- `paid` (Bool) - Required, Default: false
- `paid_date` (Date) - Optional
- `is_extra_payment` (Bool) - Optional, Default: false (indica si es un pago personalizado/extra)
- `deleted` (Date) - Optional (for soft deletes)

**API Rules:**

- List/Search: `deleted = null && ((@request.auth.id != "" && debt_id.user_id = @request.auth.id) || (@request.headers.x_share_token != "" && @collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= debt_id) || (@request.headers.x_share_token != "" && @collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= debt_id.user_id))`
- View: `deleted = null && ((@request.auth.id != "" && debt_id.user_id = @request.auth.id) || (@request.headers.x_share_token != "" && @collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= debt_id) || (@request.headers.x_share_token != "" && @collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= debt_id.user_id))`
- Create: `@request.auth != null`
- Update: `@request.auth != null`
- Delete: `@request.auth != null`

### 3. `shared_debts` Collection

**Fields:**

- `token` (Text) - Required, Unique, Indexed
- `debt_id` (Relation to `debts`) - Required, Max select: 1
- `user_id` (Relation to `users`) - Required, Max select: 1
- `expires_at` (Date) - Required
- `show_amounts` (Bool) - Required, Default: false
- `show_entity` (Bool) - Required, Default: true
- `show_dates` (Bool) - Required, Default: true
- `deleted` (Date) - Optional (for soft deletes)

**API Rules:**

- List/Search: `deleted = null && expires_at > @now`
- View: `deleted = null && expires_at > @now`
- Create: `@request.auth.id != "" && @request.auth.id = user_id`
- Update: `@request.auth.id = user_id`
- Delete: `@request.auth.id = user_id`

### 4. `shared_profiles` Collection

**Fields:**

- `token` (Text) - Required, Unique, Indexed
- `user_id` (Relation to `users`) - Required, Max select: 1
- `expires_at` (Date) - Required
- `show_amounts` (Bool) - Required, Default: false
- `show_debt_list` (Bool) - Required, Default: true
- `show_completed` (Bool) - Required, Default: true
- `deleted` (Date) - Optional (for soft deletes)

**API Rules:**

- List/Search: `deleted = null && expires_at > @now`
- View: `deleted = null && expires_at > @now`
- Create: `@request.auth.id != "" && @request.auth.id = user_id`
- Update: `@request.auth.id = user_id`
- Delete: `@request.auth.id = user_id`

## Steps to Configure in Railway PocketBase Admin:

1. Access your Railway PocketBase admin panel
2. Go to Collections > New Collection
3. Create `debts` collection with the fields above
4. Create `payments` collection with the fields above
5. Configure API rules for authentication (if needed)
6. Test the connection with the client

## Authentication (Optional)

If you want to add user authentication later:

- Enable Auth collection in PocketBase
- Update API rules to use user-specific data
- Add authentication logic to the frontend

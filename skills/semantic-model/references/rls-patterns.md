# RLS patterns (MOD-20..22)


**A. Static role per scope.** Role `RLS - EMEA`: `'Region'[Region Code] = "EMEA"`.

**B. Dynamic via security table.** Table `Security User Region` (UserPrincipalName, RegionKey),
hidden, single-direction to `Region`, then `Region` → `Sales`. Role `RLS - Dynamic Region`:

```dax
'Region'[RegionKey] IN
    CALCULATETABLE (
        VALUES ( 'Security User Region'[RegionKey] ),
        'Security User Region'[UserPrincipalName] = USERPRINCIPALNAME ()
    )
```

**C. Direct Lake.** As B, but the security table must exist in the Lakehouse; RLS on Direct Lake
falls back to DirectQuery for the filtered tables — record that in `spec.md` and test it (MOD-22).

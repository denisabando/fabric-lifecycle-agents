# RLS patterns (firm-approved)

## Pattern A — static role per region
Role `RLS - EMEA`: `'Region'[Region Code] = "EMEA"`

## Pattern B — dynamic via security table
Table `Security User Region` (UserPrincipalName, RegionKey), hidden, single-direction to `Region`,
then `Region` → `Sales`. Role `RLS - Dynamic Region`:
```dax
'Region'[RegionKey] IN
    CALCULATETABLE (
        VALUES ( 'Security User Region'[RegionKey] ),
        'Security User Region'[UserPrincipalName] = USERPRINCIPALNAME ()
    )
```

## Pattern C — Direct Lake
Same as B, but the security table must exist in the Lakehouse; RLS with Direct Lake falls back to
DirectQuery for the filtered tables — say so in `spec.md` and test it (MOD-22).

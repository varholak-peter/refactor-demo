# Refactored

The refactored implementation fixes the issues in the legacy version as best as possible, while keeping the breaking changes to a minimum.

It also provides code coverage that better reflects the complexity of the functionality.

## Approach taken

The priority is decoupling the Google Maps service from the implementation of the component render logic.

### Map Service

It is important to include some optimizations such as debounce logic, minimum characters to call the service, caching, etc. across all **map services** current and future so extracting this logic is vital.

### Map Module

We can then move the actual service logic into a separate **map module** with a unified API for every module.

### Compatibility Layer

Finally we introduce a self-contained backwards **compatibility layer** that's easily removable.

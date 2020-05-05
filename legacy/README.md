# Legacy

The Legacy implementation has some issues that need to be addressed:

- The component and Google Maps API are tightly coupled
- The component provides no clear API definition
- The component fires a fake onChange event when a suggestion is made which can lead to hard to identify bugs
- The tests don't provide sufficient functionality coverage

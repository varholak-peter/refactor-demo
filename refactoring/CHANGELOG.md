# Refactoring steps

## Verify existing tests

Make sure the existing tests (if any) can be run and all of them pass, if they are not passing identify the failing tests and skip them for now. Do **not** make any chnages to the code at this point.

## Add new tests for coverage

It is important to create a "snapshot" of the current functionality, as such we start investigating the code and create tests that validate the output of different functions.

**Note:** We may find out there are bugs in the code and may be tempted to write tests which check the proper output and then fix the code. **DON'T** do this, at this point we need to make sure we can maintain the existing functionality and this could introduce some regression bugs.

In order to create an output snapshot we can simply assert the actual value against an empty object and once the test runner complains that it received a different object we simply use that as an expected output.

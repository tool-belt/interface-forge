# Change Log

## 1.0.0

- initial release

[1.0.1]

- updated readme

[1.0.2]

- updated iteration logic
- updated readme

[1.0.3]

- updated typings

## 1.1.0

- added required build args

[1.1.1]

- fixed issue with handling of null values in isOfType helper

[1.1.2]

- fixed issue with resolving nested schema values

[1.1.3]

- fixed issue with iterating Dates

[1.1.4]

- fixed issue with iterating Dates

[1.1.5]

- updated build options

[1.1.6]

- fix iteration error

## 1.2.0

- added buildSync and batchSync
- removed .bind and compressed functionality into .use
- added .sample method

[1.2.1]

- removed counter reset from batch methods

[1.2.2]

- fixed counter issue with async defaults

## 1.3.0

- added FixtureFactory
  - .fixture
  - .fixtureSync
  - .fixtureBatch
  - .fixtureBatchSync

[1.3.1]

- removed file path from FixtureFactory constructor

[1.3.2]

- fixed validateAndNormalizeFilename

[1.3.3]

- added less strict file path validation
- reintroduced FixtureFactory default path

[1.3.4]

- added "`__fixtures__`" sub-directory
- stabilised write path validation

[1.3.5]

- fixed issue with fs.mkdirSync

## 1.4.0

- added '.derived' static method

[1.4.1]

- update validators to work recursively
- update schema merging to use recursive logic
- update schema parsing

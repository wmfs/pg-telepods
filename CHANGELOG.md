# [1.6.0](https://github.com/wmfs/pg-telepods/compare/v1.5.0...v1.6.0) (2018-08-30)


### 🛠 Builds

* **deps:** update [@wmfs](https://github.com/wmfs)/supercopy requirement from 1.0.2 to 1.1.0 ([c6ed6f8](https://github.com/wmfs/pg-telepods/commit/c6ed6f8))

# [1.5.0](https://github.com/wmfs/pg-telepods/compare/v1.4.0...v1.5.0) (2018-08-30)


### 🛠 Builds

* **deps:** update csv-string requirement from 3.1.3 to 3.1.5 ([2ea4122](https://github.com/wmfs/pg-telepods/commit/2ea4122))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement from 7.0.1 to 7.0.2 ([c5415cb](https://github.com/wmfs/pg-telepods/commit/c5415cb))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement from 7.0.2 to 7.0.3 ([65e3153](https://github.com/wmfs/pg-telepods/commit/65e3153))
* **deps-dev:** update nyc requirement from 12.0.2 to 13.0.1 ([dd2f3a9](https://github.com/wmfs/pg-telepods/commit/dd2f3a9))
* **deps-dev:** update semantic-release requirement from 15.9.11 to 15.9.12 ([416fea8](https://github.com/wmfs/pg-telepods/commit/416fea8))
* **deps-dev:** update semantic-release requirement from 15.9.3 to 15.9.5 ([69ad9e9](https://github.com/wmfs/pg-telepods/commit/69ad9e9))
* **deps-dev:** update semantic-release requirement from 15.9.5 to 15.9.6 ([e9c58de](https://github.com/wmfs/pg-telepods/commit/e9c58de))
* **deps-dev:** update semantic-release requirement from 15.9.6 to 15.9.7 ([32bd4f7](https://github.com/wmfs/pg-telepods/commit/32bd4f7))
* **deps-dev:** update semantic-release requirement from 15.9.7 to 15.9.8 ([1e3d96d](https://github.com/wmfs/pg-telepods/commit/1e3d96d))
* **deps-dev:** update semantic-release requirement from 15.9.8 to 15.9.9 ([0ec0367](https://github.com/wmfs/pg-telepods/commit/0ec0367))
* **deps-dev:** update semantic-release requirement from 15.9.9 to 15.9.11 ([ef57e63](https://github.com/wmfs/pg-telepods/commit/ef57e63))
* **deps-dev:** update semantic-release requirement to 15.9.3 ([145390c](https://github.com/wmfs/pg-telepods/commit/145390c))


### ♻️ Chores

* codecov 3.0.3 -> 3.0.4 ([c1a1e5b](https://github.com/wmfs/pg-telepods/commit/c1a1e5b))

# [1.4.0](https://github.com/wmfs/pg-telepods/compare/v1.3.0...v1.4.0) (2018-07-31)


### ✨ Features

* Can sync to a subset of the target table ([feecd55](https://github.com/wmfs/pg-telepods/commit/feecd55))


### 🚨 Tests

* Correct E string test ([8c9f8ab](https://github.com/wmfs/pg-telepods/commit/8c9f8ab))
* Define generate-where-clause ([93f3e10](https://github.com/wmfs/pg-telepods/commit/93f3e10))


### 🗑 Reverts

* Reenable partial-table tests ([2f4624b](https://github.com/wmfs/pg-telepods/commit/2f4624b))

# [1.3.0](https://github.com/wmfs/pg-telepods/compare/v1.2.0...v1.3.0) (2018-07-31)


### ✨ Features

* Only returns a promise - no longer supports taking a callback ([2579a8d](https://github.com/wmfs/pg-telepods/commit/2579a8d))


### 🛠 Builds

* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/changelog requirement to 2.1.2 ([52ed5f1](https://github.com/wmfs/pg-telepods/commit/52ed5f1))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/changelog requirement to 3.0.0 ([d965c43](https://github.com/wmfs/pg-telepods/commit/d965c43))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement to 6.0.2 ([349e406](https://github.com/wmfs/pg-telepods/commit/349e406))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement to 7.0.0 ([17db111](https://github.com/wmfs/pg-telepods/commit/17db111))
* **deps-dev:** update [@semantic-release](https://github.com/semantic-release)/git requirement to 7.0.1 ([ac24141](https://github.com/wmfs/pg-telepods/commit/ac24141))
* **deps-dev:** update semantic-release requirement to 15.7.2 ([1f0cab4](https://github.com/wmfs/pg-telepods/commit/1f0cab4))
* **deps-dev:** update semantic-release requirement to 15.8.0 ([d066bd3](https://github.com/wmfs/pg-telepods/commit/d066bd3))
* **deps-dev:** update semantic-release requirement to 15.8.1 ([82d5954](https://github.com/wmfs/pg-telepods/commit/82d5954))
* **deps-dev:** update semantic-release requirement to 15.9.1 ([9917466](https://github.com/wmfs/pg-telepods/commit/9917466))
* **deps-dev:** update semantic-release requirement to 15.9.2 ([04faf33](https://github.com/wmfs/pg-telepods/commit/04faf33))


### 📦 Code Refactoring

* pull out createDirectories ([d7a54ca](https://github.com/wmfs/pg-telepods/commit/d7a54ca))


### 🚨 Tests

* Add more test data, in preparation for partial table sync ([8e7cea1](https://github.com/wmfs/pg-telepods/commit/8e7cea1))
* Added extra describe sections ([6980e04](https://github.com/wmfs/pg-telepods/commit/6980e04))
* check the number of lines in the delete csv ([95a1722](https://github.com/wmfs/pg-telepods/commit/95a1722))
* Disable partial table tests for the moment ([be6cfa3](https://github.com/wmfs/pg-telepods/commit/be6cfa3))
* Tests for partial-table sync ([345b0d1](https://github.com/wmfs/pg-telepods/commit/345b0d1))


### ⚙️ Continuous Integrations

* remove deps-dev scoping release ([283a434](https://github.com/wmfs/pg-telepods/commit/283a434))

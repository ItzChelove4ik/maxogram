# Maxogram

Открытый клиент MAX на **Tauri 2, Rust и Svelte 5**. Этот репозиторий содержит исходники MaxPlus 0.1.7 и настройку сборки iOS для Maxogram.

Исходный проект: [MaxPlus](https://github.com/junioraww/maxplus). Авторство и лицензия MIT сохранены в [LICENSE](LICENSE); библиотека `rumax` включает собственную [лицензию](src-tauri/vendor/rumax/LICENSE).

## Разработка

Установите [Bun](https://bun.sh), стабильный [Rust](https://rustup.rs) и [системные зависимости Tauri](https://v2.tauri.app/start/prerequisites/).

```sh
bun install --frozen-lockfile
bun run tauri dev
```

Проверка и сборка интерфейса:

```sh
bun run check
bun run build
```

Сборка интерфейса `bun run build` проверена успешно. В исходниках 0.1.7 проверка `bun run check` пока сообщает об ошибках типов в JavaScript/Svelte; они требуют отдельной работы и не блокируют сборку интерфейса.

Для Android Firebase-конфигурацию необходимо предоставить самостоятельно: `src-tauri/gen/android/app/google-services.json`. Локальная конфигурация и ключи подписи исключены из Git.

## IPA для iPhone

В [GitHub Actions](https://github.com/ItzChelove4ik/maxogram/actions/workflows/ios.yml) откройте **Build iOS IPA** и нажмите **Run workflow**. Сборка выполняется на macOS с Xcode для настоящего устройства `aarch64-apple-ios`.

После успешной сборки IPA появляется в [Releases](https://github.com/ItzChelove4ik/maxogram/releases) и в артефактах запуска. Workflow проверяет структуру IPA и наличие исполняемого файла ARM64, затем публикует контрольную сумму SHA-256.

**IPA не подписан сертификатом Apple.** Для установки на iPhone его нужно подписать, например через AltStore или SideStore. Это не сборка для App Store или TestFlight. Проверка сборки не заменяет тестирование функций на устройстве.

Локальная сборка на Mac:

```sh
rustup target add aarch64-apple-ios
brew install xcodegen
bun install --frozen-lockfile
bun run tauri ios init --ci --skip-targets-install
bun run tauri ios build --ci --target aarch64 --no-sign
```

Внутренний идентификатор приложения исходного проекта: `org.meowkie.max`; отображаемое имя: `MAX`.

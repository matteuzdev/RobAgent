plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.robagent.radar"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.robagent.radar"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"

        buildConfigField("String", "RADAR_API_URL", "\"https://YOUR-API.example.com\"")
        buildConfigField("String", "RADAR_INGEST_SECRET", "\"CHANGE_ME\"")

        // Optional comma-separated keywords. Empty = capture all WhatsApp notifications.
        // Example: "IA Builders,Repos e Agentes"
        buildConfigField("String", "RADAR_SOURCE_FILTER", "\"\"")
    }

    buildFeatures { buildConfig = true }
}

dependencies {
    implementation("androidx.work:work-runtime-ktx:2.10.0")
}

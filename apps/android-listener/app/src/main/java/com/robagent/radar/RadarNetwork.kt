package com.robagent.radar

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class CaptureEvent(
    val eventId: String,
    val sourceApp: String,
    val title: String?,
    val text: String,
    val subText: String?,
    val postedAt: String
)

object RadarNetwork {
    fun send(event: CaptureEvent): Boolean {
        return runCatching {
            val base = BuildConfig.RADAR_API_URL.trimEnd('/')
            val connection = URL("$base/v1/ingest/android").openConnection() as HttpURLConnection

            connection.requestMethod = "POST"
            connection.connectTimeout = 10_000
            connection.readTimeout = 20_000
            connection.doOutput = true
            connection.setRequestProperty("Content-Type", "application/json")
            connection.setRequestProperty("X-Radar-Secret", BuildConfig.RADAR_INGEST_SECRET)

            val payload = JSONObject()
                .put("eventId", event.eventId)
                .put("sourceApp", event.sourceApp)
                .put("title", event.title)
                .put("text", event.text)
                .put("subText", event.subText)
                .put("postedAt", event.postedAt)
                .toString()

            connection.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }
            val status = connection.responseCode
            connection.disconnect()

            // 2xx includes accepted and duplicate events.
            status in 200..299
        }.getOrElse {
            it.printStackTrace()
            false
        }
    }
}

package com.robagent.radar

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class NotificationCaptureService : NotificationListenerService() {
    private val allowedPackages = setOf("com.whatsapp", "com.whatsapp.w4b")

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName !in allowedPackages) return

        val extras = sbn.notification.extras
        val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
            ?: extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
            ?: return
        val subText = extras.getCharSequence(Notification.EXTRA_SUB_TEXT)?.toString()

        if (text.isBlank()) return

        val filters = BuildConfig.RADAR_SOURCE_FILTER
            .split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }

        val searchable = listOfNotNull(title, subText, text).joinToString(" ")
        if (filters.isNotEmpty() && filters.none { searchable.contains(it, ignoreCase = true) }) {
            return
        }

        RadarWorker.enqueue(
            context = this,
            event = CaptureEvent(
                eventId = sbn.key,
                sourceApp = sbn.packageName,
                title = title,
                text = text,
                subText = subText,
                postedAt = java.time.Instant.ofEpochMilli(sbn.postTime).toString()
            )
        )
    }
}

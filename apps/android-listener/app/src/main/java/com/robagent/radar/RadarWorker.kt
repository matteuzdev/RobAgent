package com.robagent.radar

import android.content.Context
import androidx.work.BackoffPolicy
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

class RadarWorker(
    appContext: Context,
    params: WorkerParameters
) : CoroutineWorker(appContext, params) {

    override suspend fun doWork(): Result {
        val event = CaptureEvent(
            eventId = inputData.getString("eventId") ?: return Result.failure(),
            sourceApp = inputData.getString("sourceApp") ?: "unknown",
            title = inputData.getString("title"),
            text = inputData.getString("text") ?: return Result.failure(),
            subText = inputData.getString("subText"),
            postedAt = inputData.getString("postedAt") ?: ""
        )

        return if (RadarNetwork.send(event)) Result.success() else Result.retry()
    }

    companion object {
        fun enqueue(context: Context, event: CaptureEvent) {
            val data = Data.Builder()
                .putString("eventId", event.eventId)
                .putString("sourceApp", event.sourceApp)
                .putString("title", event.title)
                .putString("text", event.text.take(9_000))
                .putString("subText", event.subText)
                .putString("postedAt", event.postedAt)
                .build()

            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val work = OneTimeWorkRequestBuilder<RadarWorker>()
                .setInputData(data)
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.SECONDS)
                .build()

            WorkManager.getInstance(context).enqueue(work)
        }
    }
}

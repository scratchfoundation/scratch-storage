/* eslint-env worker */
/* eslint-disable-next-line spaced-comment */
/// <reference lib="webworker" />

interface JobMessage {
    id: string,
    url: string;
    options: RequestInit | undefined;
}

interface CompletionMessage {
    id: string,
    buffer?: ArrayBuffer | null;
    error?: string;
}

let jobsActive = 0;
const complete: CompletionMessage[] = [];

let intervalId: ReturnType<typeof setInterval> | undefined = void 0;

/**
 * Register a step function.
 *
 * Step checks if there are completed jobs and if there are sends them to the
 * parent. Then it checks the jobs count. If there are no further jobs, clear
 * the step.
 */
const registerStep = function () {
    intervalId = setInterval(() => {
        if (complete.length) {
            // Send our chunk of completed requests and instruct postMessage to
            // transfer the buffers instead of copying them.
            postMessage(
                complete.slice(),
                // Instruct postMessage that these buffers in the sent message
                // should use their Transferable trait. After the postMessage
                // call the "buffers" will still be in complete if you looked,
                // but they will all be length 0 as the data they reference has
                // been sent to the window. This lets us send a lot of data
                // without the normal postMessage behaviour of making a copy of
                // all of the data for the window.
                complete.map(response => response.buffer).filter(Boolean) as Transferable[]
            );
            complete.length = 0;
        }
        if (jobsActive === 0) {
            clearInterval(intervalId);
            intervalId = void 0;
        }
    }, 1);
};

/**
 * Receive a job from the parent and fetch the requested data.
 * @param message The message from the parent.
 * @param message.data A job id, url, and options descriptor to perform.
 */
const onMessage = ({data: job}: MessageEvent<JobMessage>) => {
    if (jobsActive === 0 && !intervalId) {
        registerStep();
    }

    jobsActive++;

    fetch(job.url, job.options)
        .then(result => {
            if (result.ok) return result.arrayBuffer();
            if (result.status === 404) return null;
            return Promise.reject(result.status);
        })
        .then(buffer => complete.push({id: job.id, buffer}))
        .catch(error => complete.push({id: job.id, error: (error && error.message) || `Failed request: ${job.url}`}))
        .then(() => jobsActive--);
};

// "fetch" is supported in Node.js as of 16.15 and our target browsers as of ~2017
postMessage({support: {fetch: true}});
self.addEventListener('message', onMessage);

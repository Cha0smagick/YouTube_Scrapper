# YouTube Channel Video Data Extractor using Google Apps Script

This project is a Google Apps Script that extracts all videos from a YouTube channel and retrieves metrics like views, likes, and average watch time. The script then writes this data into a Google Sheets document for further analysis.

## Features

- Fetches all videos from a YouTube channel using pagination.
- Retrieves video details such as:
  - Title
  - URL
  - Views
  - Likes
  - Estimated average watch time (in seconds).
  
## Requirements

- A Google account.
- Access to Google Sheets.
- A YouTube API key (from the Google Developer Console).

## Setup Guide

### Step 1: Get YouTube API Key

1. Go to the [Google Developer Console](https://console.developers.google.com/).
2. Create a new project or use an existing one.
3. In the project dashboard, click on **Enable APIs and Services**.
4. Search for **YouTube Data API v3** and enable it.
5. After enabling, go to **Credentials** and click on **Create Credentials**.
6. Choose **API Key** as the credential type.
7. Copy the generated API key — you'll need it for the script.

### Step 2: Set up Google Sheets

1. Open a new Google Sheets document.
2. Go to **Extensions > Apps Script** to open the Google Apps Script editor.
3. Delete any existing code in the script editor.
4. Copy and paste the following code into the Apps Script editor after you add your YouTube API KEy al YouTube ID Channel:

```javascript
// Function to fetch all YouTube videos and their metrics
function getAllYouTubeVideosAndMetrics() {
  var apiKey = "YOUR_API_KEY";  // Replace with your YouTube API Key
  var channelId = "YOUR_CHANNEL_ID";  // Replace with your YouTube Channel ID
  var videos = [];
  var nextPageToken = '';
  
  do {
    var url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet&type=video&order=date&maxResults=50&pageToken=${nextPageToken}`;
    var response = UrlFetchApp.fetch(url);
    var json = JSON.parse(response.getContentText());
    
    json.items.forEach(function(item) {
      var videoId = item.id.videoId;
      var title = item.snippet.title;
      var videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Fetch video metrics
      var videoDetails = getVideoDetails(apiKey, videoId);
      var views = videoDetails.viewCount;
      var likes = videoDetails.likeCount;
      var avgWatchTime = videoDetails.averageViewDuration;  // Estimated average watch time

      videos.push([title, videoUrl, views, likes, avgWatchTime]);
    });
    
    nextPageToken = json.nextPageToken || '';
  } while (nextPageToken);
  
  // Write the data to Google Sheets
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); // Clear the current sheet
  sheet.appendRow(["Title", "URL", "Views", "Likes", "Average Watch Time (seconds)"]);
  sheet.getRange(2, 1, videos.length, videos[0].length).setValues(videos);
}

// Function to fetch video metrics like views, likes, and average retention time
function getVideoDetails(apiKey, videoId) {
  var url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=statistics,contentDetails`;
  var response = UrlFetchApp.fetch(url);
  var videoData = JSON.parse(response.getContentText());
  
  if (videoData.items.length > 0) {
    var stats = videoData.items[0].statistics;
    var contentDetails = videoData.items[0].contentDetails;
    var avgWatchTime = calculateAverageWatchTime(contentDetails.duration, stats.viewCount);
  
    return {
      viewCount: stats.viewCount || 0,
      likeCount: stats.likeCount || 0,
      averageViewDuration: avgWatchTime
    };
  }
  
  return { viewCount: 0, likeCount: 0, averageViewDuration: 0 };
}

// Function to estimate the average watch time (in seconds)
function calculateAverageWatchTime(duration, viewCount) {
  // Convert video duration from ISO 8601 format to seconds
  var durationInSeconds = convertDurationToSeconds(duration);
  
  // Estimated average watch time (assumed as 50% retention rate for simplicity)
  var avgWatchTime = (durationInSeconds / 2);
  
  return avgWatchTime;
}

// Convert ISO 8601 duration (e.g., PT10M30S) to seconds
function convertDurationToSeconds(duration) {
  var matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  var hours = (matches[1] ? parseInt(matches[1]) : 0);
  var minutes = (matches[2] ? parseInt(matches[2]) : 0);
  var seconds = (matches[3] ? parseInt(matches[3]) : 0);
  
  return (hours * 3600) + (minutes * 60) + seconds;
}

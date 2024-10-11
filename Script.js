// Función principal que obtiene todos los videos y métricas de YouTube
function getAllYouTubeVideosAndMetrics() {
  var apiKey = "TU_API_KEY_DE_GOOGLE";  // Reemplaza con tu API Key
  var channelId = "EL_ID_DE_TU_CANAL_DE_YT";  // Reemplaza con el ID de tu canal de YouTube
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
      
      // Llamada a la API para obtener las métricas del video
      var videoDetails = getVideoDetails(apiKey, videoId);
      var views = videoDetails.viewCount;
      var likes = videoDetails.likeCount;
      var avgWatchTime = videoDetails.averageViewDuration;  // Tiempo promedio de retención

      videos.push([title, videoUrl, views, likes, avgWatchTime]);
    });
    
    nextPageToken = json.nextPageToken || '';
  } while (nextPageToken);
  
  // Escribir los datos en la hoja de cálculo
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear(); // Limpiar la hoja actual
  sheet.appendRow(["Título", "URL", "Vistas", "Me Gusta", "Tiempo promedio de retención (segundos)"]);
  sheet.getRange(2, 1, videos.length, videos[0].length).setValues(videos);
}

// Función para obtener los detalles de un video como vistas, me gusta y retención promedio
function getVideoDetails(apiKey, videoId) {
  var url = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=statistics,contentDetails`;
  var response = UrlFetchApp.fetch(url);
  var videoData = JSON.parse(response.getContentText());
  
  if (videoData.items.length > 0) {
    var stats = videoData.items[0].statistics;
    var contentDetails = videoData.items[0].contentDetails;
    var avgWatchTime = calculateAverageWatchTime(contentDetails.duration, stats.viewCount);  // Método para calcular el tiempo promedio de retención
  
    return {
      viewCount: stats.viewCount || 0,
      likeCount: stats.likeCount || 0,
      averageViewDuration: avgWatchTime
    };
  }
  
  return { viewCount: 0, likeCount: 0, averageViewDuration: 0 };
}

// Función para calcular el tiempo promedio de retención (en segundos)
function calculateAverageWatchTime(duration, viewCount) {
  // Convierte la duración del video de formato ISO 8601 a segundos
  var durationInSeconds = convertDurationToSeconds(duration);
  
  // El tiempo promedio de retención puede ser un estimado si no tienes acceso a la API de Analytics
  // Puedes modificar este cálculo según tu preferencia
  var avgWatchTime = (durationInSeconds / 2);  // Suposición: 50% de retención promedio
  
  return avgWatchTime;
}

// Convierte la duración de formato ISO 8601 (ej. PT10M30S) a segundos
function convertDurationToSeconds(duration) {
  var matches = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  var hours = (matches[1] ? parseInt(matches[1]) : 0);
  var minutes = (matches[2] ? parseInt(matches[2]) : 0);
  var seconds = (matches[3] ? parseInt(matches[3]) : 0);
  
  return (hours * 3600) + (minutes * 60) + seconds;
}

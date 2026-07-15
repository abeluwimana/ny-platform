const assert = require('assert');
const fs = require('fs');
const path = require('path');

const routeFile = path.join(__dirname, '..', 'routes', 'videoRoutes.js');
const content = fs.readFileSync(routeFile, 'utf8');

assert(
  content.includes("authorize('COUPLE', 'ADMIN')"),
  'Video upload route should authorize only couples and admins'
);

const videosPagePath = path.join(__dirname, '..', '..', 'src', 'pages', 'Videos.jsx');
const videosPageContent = fs.readFileSync(videosPagePath, 'utf8');

assert(
  videosPageContent.includes('handleUploadSubmit') || videosPageContent.includes('Upload video'),
  'Videos page should include an upload video form'
);

assert(
  videosPageContent.includes("['ADMIN', 'COUPLE']") || videosPageContent.includes("['admin', 'couple']"),
  'Videos page should only show the upload action for admins or couples'
);

assert(
  !videosPageContent.includes('|| 1'),
  'Videos page should not default to a placeholder couple ID'
);

console.log('Video route authorization test passed');
console.log('Videos page upload UI test passed');

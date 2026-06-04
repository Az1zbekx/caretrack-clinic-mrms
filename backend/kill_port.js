try {
  process.kill(24513, 'SIGKILL');
  console.log('Killed 24513');
} catch (e) {}
try {
  process.kill(24514, 'SIGKILL');
  console.log('Killed 24514');
} catch (e) {}

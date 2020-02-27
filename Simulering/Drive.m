function [driveSensOut,lastAddedDriveSensOut,lastDrivenInPairOut] = Drive(i,driveSensIn,t,lastAddedDriveSensIn,lastDrivenInPairIn)
%Sätter sensor i till drivande samt stänger av de 3 sensorerna längst bort
driveSensOut = driveSensIn;
lastAddedDriveSensOut = lastAddedDriveSensIn;
lastDrivenInPairOut = lastDrivenInPairIn;
driveSensOut(i) = 1;
k = 1;
l = 1;
m = 1;
if( i < 4)
    k = 0;
    l = 0;
    m = 0;
elseif(i < 5)
    k = 0;
    l = 0;
    m = 1;
elseif(i < 6)
    k = 0;
    l = 1;
    m = 1;
end
driveSensOut(mod(i+3,9) + k) = 0;
driveSensOut(mod(i+4,9) + l) = 0;
driveSensOut(mod(i+5,9) + m) = 0;

lastAddedDriveSensOut(4) = lastAddedDriveSensIn(2);
lastAddedDriveSensOut(3) = lastAddedDriveSensIn(1);
lastAddedDriveSensOut(2) = t;
lastAddedDriveSensOut(1) = i;

if(i<5)
    lastDrivenInPairOut(i+4) = lastDrivenInPairIn(i);
    lastDrivenInPairOut(i) = 1;
else
    lastDrivenInPairOut(i) = lastDrivenInPairIn(i-4);
    lastDrivenInPairOut(i-4) = 0;
end
end


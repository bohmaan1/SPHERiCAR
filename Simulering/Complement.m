function [complement] = Complement(i,driveSensIn)
%Är komplementet på linjen?
l = 1;
if(i < 5)
    l = 0;
end
complement = driveSensIn(mod(i+4,9) + l);

end


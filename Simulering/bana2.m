clc;
%clf;
%hold on;
%grid on;
%axis equal;

OuterLinesX = [];
OuterLinesY = [];
InnerLinesX = [];
InnerLinesY = [];

steps = 100;

t = 0:1/steps:1;
offset = ones(1,steps+1);

normToLine = [
	cos(pi/2) -sin(pi/2)
	sin(pi/2)	cos(pi/2)
];

thickness = str2num(get_param('model/World/Tracksystem', 'thickness'));
linePath = str2num(get_param('model/World/Tracksystem', 'linePath'));
th = thickness / 10000;
tc = thickness / 1000;

x = 1;
y = 2;

previousAngle = 180;
for i = 1 : length(linePath)-1
	
	p1 = linePath(i,:);
	p2 = linePath(i+1,:);

	p = p2 - p1;
	angle = atan2(p(2), p(1)) * 360/2/pi;
	
	diffAngle = 180 - mod(previousAngle - angle, 360);
	previousAngle = angle;
	
	counterClockwiseShift = (thickness+th) * transpose(normToLine*transpose(p/norm(p)));
	
	lineX = p(x).*t;
	lineY = p(y).*t;
	
	if (diffAngle < 0)
		OuterLinesX = [OuterLinesX (p1(x)+(thickness+tc)*cos(angle/180*pi+2*pi*t))];
		OuterLinesY = [OuterLinesY (p1(y)+(thickness+tc)*sin(angle/180*pi+2*pi*t))];
	elseif (diffAngle > 0)
		InnerLinesX = [InnerLinesX (p1(x)+(thickness+tc)*cos(angle/180*pi-2*pi*t))];
		InnerLinesY = [InnerLinesY (p1(y)+(thickness+tc)*sin(angle/180*pi-2*pi*t))];
	end
	
	OuterLinesX = [OuterLinesX ((p1(x)-counterClockwiseShift(x)).*offset + lineX)];
	OuterLinesY = [OuterLinesY ((p1(y)-counterClockwiseShift(y)).*offset + lineY)];
	InnerLinesX = [InnerLinesX ((p1(x)+counterClockwiseShift(x)).*offset + lineX)];
	InnerLinesY = [InnerLinesY ((p1(y)+counterClockwiseShift(y)).*offset + lineY)];
	
end

OuterLines = transpose([OuterLinesX; OuterLinesY]);
InnerLines = transpose([InnerLinesX; InnerLinesY]);

j = 0;
while (j < length(OuterLines))
	j = j + 1;
	
	p = OuterLines(j,:);
	
	xx = p(x);
	yy = p(y);

	b = false;

	for i = 1 : length(linePath)-1
		p0 = [xx yy];

		p1 = linePath(i,:);
		p2 = linePath(i+1,:);

		p = p2 - p1;

		angle = -atan2(p(2), p(1));

		A = [
			cos(angle) -sin(angle)
			sin(angle)	cos(angle)
		];

		p0 = A*transpose(p0);
		p1 = A*transpose(p1);
		p2 = A*transpose(p2);

		if or(and(p0(x) > p1(x), p0(x) < p2(x)), and(p0(x) > p2(x), p0(x) < p1(x)))
			% IT IS INBETWEEN! COMPARE Y COORDS
			if abs(p0(2)-p1(2)) <= thickness
				% WE ARE POSITIVE
				b = true;
				break;
			end
		elseif min(norm(p1-p0), norm(p2-p0)) < thickness
			b = true;
			break;
		end

	end
	
	if b
		OuterLines = [OuterLines(1:j-1,:); OuterLines(j+1:end,:)];
		j = j - 1;
	end
	
end

j = 0;
while (j < length(InnerLines))
	j = j + 1;
	
	p = InnerLines(j,:);
	
	xx = p(x);
	yy = p(y);

	b = false;

	for i = 1 : length(linePath)-1
		
		p0 = [xx yy];

		p1 = linePath(i,:);
		p2 = linePath(i+1,:);

		p = p2 - p1;

		angle = -atan2(p(2), p(1));

		A = [
			cos(angle) -sin(angle)
			sin(angle)	cos(angle)
		];

		p0 = A*transpose(p0);
		p1 = A*transpose(p1);
		p2 = A*transpose(p2);

		if or(and(p0(1) > p1(1), p0(1) < p2(1)), and(p0(1) > p2(1), p0(1) < p1(1)))
			% IT IS INBETWEEN! COMPARE Y COORDS
			if abs(p0(2)-p1(2)) <= thickness
				% WE ARE POSITIVE
				b = true;
				break;
			end
		elseif min(norm(p1-p0), norm(p2-p0)) < thickness
			b = true;
			break;
		end

	end
	
	if b
		InnerLines = [InnerLines(1:j-1,:); InnerLines(j+1:end,:)];
		j = j - 1;
	end
	
end

j = 0;
while (j < length(OuterLines)-1)
	j = j + 1;
	
	b = false;
	
	p1 = OuterLines(j,:);
	p2 = OuterLines(j+1,:);
	
	if norm(p1-p2) < 2*th
		b = true;
	end
	
	if b
		OuterLines = [OuterLines(1:j-1,:); OuterLines(j+1:end,:)];
		j = j - 1;
	end
end

j = 0;
while (j < length(InnerLines)-1)
	j = j + 1;
	
	b = false;
	
	p1 = InnerLines(j,:);
	p2 = InnerLines(j+1,:);
	
	if norm(p1-p2) < 2*th
		b = true;
	end
	
	if b
		InnerLines = [InnerLines(1:j-1,:); InnerLines(j+1:end,:)];
		j = j - 1;
	end
end


%plot([OuterLines(:,x); OuterLines(1,x)], [OuterLines(:,y); OuterLines(1,y)]);
%plot([InnerLines(:,x); InnerLines(1,x)], [InnerLines(:,y); InnerLines(1,y)]);

FinalOuterLines = [OuterLines 1/10000 * ones(length(OuterLines), 1)];
FinalInnerLines = [InnerLines 1/10000 * ones(length(InnerLines), 1)];



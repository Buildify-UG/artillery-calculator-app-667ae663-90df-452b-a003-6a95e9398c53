import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Crosshair, Target, Wind, Gauge } from 'lucide-react';

const Index = () => {
  // Ballistics calculation state
  const [muzzleVelocity, setMuzzleVelocity] = useState(800);
  const [angle, setAngle] = useState(45);
  const [windSpeed, setWindSpeed] = useState(5);
  const [windDirection, setWindDirection] = useState('0');
  const [distance, setDistance] = useState(1000);
  const [caliber, setCaliber] = useState('155mm');
  const [weight, setWeight] = useState(43);

  // Physics constants
  const G = 9.81; // gravity
  const AIR_DENSITY = 1.225; // kg/m³

  // Calculate ballistic trajectory
  const trajectoryData = useMemo(() => {
    const data = [];
    const angleRad = (angle * Math.PI) / 180;
    const vx = muzzleVelocity * Math.cos(angleRad);
    const vy = muzzleVelocity * Math.sin(angleRad);

    let time = 0;
    const dt = 0.01;
    let x = 0, y = 0;

    while (y >= 0 && x <= distance * 2) {
      data.push({
        distance: Math.round(x),
        height: Math.round(y),
        time: Math.round(time * 100) / 100
      });
      
      x = vx * time;
      y = vy * time - 0.5 * G * time * time;
      time += dt;
    }

    return data;
  }, [muzzleVelocity, angle]);

  // Calculate impact parameters
  const impactData = useMemo(() => {
    const angleRad = (angle * Math.PI) / 180;
    const vx = muzzleVelocity * Math.cos(angleRad);
    const vy = muzzleVelocity * Math.sin(angleRad);
    
    // Time to target
    const timeToTarget = distance / vx;
    
    // Height at target distance
    const heightAtTarget = vy * timeToTarget - 0.5 * G * timeToTarget * timeToTarget;
    
    // Velocity at impact
    const vxImpact = vx;
    const vyImpact = vy - G * timeToTarget;
    const velocityAtImpact = Math.sqrt(vxImpact * vxImpact + vyImpact * vyImpact);
    
    // Wind deflection (simplified)
    const windDeflection = (windSpeed * timeToTarget * timeToTarget) / 2;
    
    // Range at optimal angle
    const optimalRange = (muzzleVelocity * muzzleVelocity * Math.sin(2 * angleRad)) / G;
    
    // Max height
    const maxHeight = (vy * vy) / (2 * G);

    return {
      timeToTarget: Math.round(timeToTarget * 100) / 100,
      heightAtTarget: Math.round(heightAtTarget),
      velocityAtImpact: Math.round(velocityAtImpact),
      windDeflection: Math.round(windDeflection),
      optimalRange: Math.round(optimalRange),
      maxHeight: Math.round(maxHeight)
    };
  }, [muzzleVelocity, angle, distance, windSpeed]);

  // Caliber data
  const calibers = [
    { name: '155mm', muzzleVel: 800, weight: 43 },
    { name: '105mm', muzzleVel: 700, weight: 15 },
    { name: '203mm', muzzleVel: 730, weight: 92 },
    { name: '75mm', muzzleVel: 650, weight: 5.5 },
    { name: '81mm Mortar', muzzleVel: 200, weight: 2.7 }
  ];

  const handleCaliberChange = (value) => {
    setCaliber(value);
    const cal = calibers.find(c => c.name === value);
    if (cal) {
      setMuzzleVelocity(cal.muzzleVel);
      setWeight(cal.weight);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crosshair className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">حاسبة المدفعية</h1>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-blue-200">حاسبة باليستية متقدمة لحساب مسارات القذائف</p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-800 border border-blue-500">
            <TabsTrigger value="calculator" className="text-white">الحاسبة</TabsTrigger>
            <TabsTrigger value="trajectory" className="text-white">المسار</TabsTrigger>
            <TabsTrigger value="analysis" className="text-white">التحليل</TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card className="bg-slate-800 border-blue-500 border-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-blue-400" />
                    معاملات الإطلاق
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-blue-200">نوع المدفع</Label>
                    <Select value={caliber} onValueChange={handleCaliberChange}>
                      <SelectTrigger className="bg-slate-700 border-blue-400 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-blue-400">
                        {calibers.map(cal => (
                          <SelectItem key={cal.name} value={cal.name} className="text-white">
                            {cal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-blue-200">سرعة الفوهة (م/ث): {muzzleVelocity}</Label>
                    <Input
                      type="range"
                      min="100"
                      max="1200"
                      value={muzzleVelocity}
                      onChange={(e) => setMuzzleVelocity(Number(e.target.value))}
                      className="bg-slate-700 border-blue-400"
                    />
                  </div>

                  <div>
                    <Label className="text-blue-200">زاوية الإطلاق (درجة): {angle}°</Label>
                    <Input
                      type="range"
                      min="0"
                      max="90"
                      value={angle}
                      onChange={(e) => setAngle(Number(e.target.value))}
                      className="bg-slate-700 border-blue-400"
                    />
                  </div>

                  <div>
                    <Label className="text-blue-200">المسافة المستهدفة (م): {distance}</Label>
                    <Input
                      type="range"
                      min="100"
                      max="5000"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="bg-slate-700 border-blue-400"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Wind className="w-5 h-5 text-blue-400 mt-2" />
                    <div className="flex-1">
                      <Label className="text-blue-200">سرعة الرياح (م/ث): {windSpeed}</Label>
                      <Input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={windSpeed}
                        onChange={(e) => setWindSpeed(Number(e.target.value))}
                        className="bg-slate-700 border-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-blue-200">وزن القذيفة (كغ): {weight}</Label>
                    <Input
                      type="number"
                      value={weight}
                      readOnly
                      className="bg-slate-700 border-blue-400 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Results Panel */}
              <Card className="bg-slate-800 border-green-500 border-2">
                <CardHeader>
                  <CardTitle className="text-white">نتائج الحساب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 p-4 rounded border border-green-500">
                      <p className="text-green-400 text-sm">وقت الرحلة</p>
                      <p className="text-white text-2xl font-bold">{impactData.timeToTarget}s</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded border border-green-500">
                      <p className="text-green-400 text-sm">سرعة التأثير</p>
                      <p className="text-white text-2xl font-bold">{impactData.velocityAtImpact} م/ث</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded border border-green-500">
                      <p className="text-green-400 text-sm">الارتفاع عند الهدف</p>
                      <p className="text-white text-2xl font-bold">{impactData.heightAtTarget} م</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded border border-green-500">
                      <p className="text-green-400 text-sm">انحراف الرياح</p>
                      <p className="text-white text-2xl font-bold">{impactData.windDeflection} م</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded border border-green-500">
                      <p className="text-green-400 text-sm">أقصى ارتفاع</p>
                      <p className="text-white text-2xl font-bold">{impactData.maxHeight} م</p>
                    </div>
                    <div className="bg-slate-700 p-4 rounded border border-green-500">
                      <p className="text-green-400 text-sm">المدى الأمثل</p>
                      <p className="text-white text-2xl font-bold">{impactData.optimalRange} م</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Trajectory Tab */}
          <TabsContent value="trajectory">
            <Card className="bg-slate-800 border-blue-500 border-2">
              <CardHeader>
                <CardTitle className="text-white">مسار القذيفة</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trajectoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="distance" stroke="#cbd5e1" label={{ value: 'المسافة (م)', position: 'insideBottomRight', offset: -10, fill: '#cbd5e1' }} />
                    <YAxis stroke="#cbd5e1" label={{ value: 'الارتفاع (م)', angle: -90, position: 'insideLeft', fill: '#cbd5e1' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '2px solid #3b82f6' }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="height"
                      stroke="#3b82f6"
                      dot={false}
                      strokeWidth={3}
                      name="الارتفاع"
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <Card className="bg-slate-800 border-blue-500 border-2">
              <CardHeader>
                <CardTitle className="text-white">تحليل الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-white font-bold mb-4">مقارنة الزوايا</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[30, 45, 60].map(a => {
                          const angleRad = (a * Math.PI) / 180;
                          const range = (muzzleVelocity * muzzleVelocity * Math.sin(2 * angleRad)) / 9.81;
                          return { angle: `${a}°`, range: Math.round(range) };
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="angle" stroke="#cbd5e1" />
                        <YAxis stroke="#cbd5e1" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '2px solid #3b82f6' }} />
                        <Bar dataKey="range" fill="#10b981" name="المدى (م)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-slate-700 p-6 rounded border border-blue-500 space-y-3">
                    <h3 className="text-white font-bold">معلومات النظام</h3>
                    <p className="text-blue-200"><span className="font-bold">المدفع:</span> {caliber}</p>
                    <p className="text-blue-200"><span className="font-bold">وزن القذيفة:</span> {weight} كغ</p>
                    <p className="text-blue-200"><span className="font-bold">سرعة الفوهة:</span> {muzzleVelocity} م/ث</p>
                    <p className="text-blue-200"><span className="font-bold">الزاوية الحالية:</span> {angle}°</p>
                    <p className="text-blue-200"><span className="font-bold">سرعة الرياح:</span> {windSpeed} م/ث</p>
                    <p className="text-blue-200"><span className="font-bold">المسافة المستهدفة:</span> {distance} م</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

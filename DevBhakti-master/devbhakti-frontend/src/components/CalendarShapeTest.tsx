"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function CalendarShapeTest() {
  const [selectedDateSquare, setSelectedDateSquare] = useState<Date | undefined>(new Date());
  const [selectedDateCircle, setSelectedDateCircle] = useState<Date | undefined>(new Date());

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Calendar Shape Options Test</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Square Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Square Selected Date
              <Badge variant="outline">Default</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDateSquare}
              onSelect={setSelectedDateSquare}
              selectedDateShape="square"
              className="rounded-md border"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Selected date has square corners (default behavior)
            </p>
          </CardContent>
        </Card>

        {/* Circular Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Circular Selected Date
              <Badge variant="outline">New Feature</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDateCircle}
              onSelect={setSelectedDateCircle}
              selectedDateShape="circle"
              className="rounded-md border"
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Selected date has circular corners (new feature)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Square (default):</h4>
              <code className="block p-2 bg-muted rounded text-sm">
                {`<Calendar selectedDateShape="square" />`}
              </code>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Circular:</h4>
              <code className="block p-2 bg-muted rounded text-sm">
                {`<Calendar selectedDateShape="circle" />`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

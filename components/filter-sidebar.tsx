"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FilterSidebar() {
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState("recommended")

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Sort By</h3>
        <RadioGroup value={sortBy} onValueChange={setSortBy} className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="recommended" id="recommended" />
            <Label htmlFor="recommended" className="cursor-pointer">
              Recommended
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="price_low" id="price_low" />
            <Label htmlFor="price_low" className="cursor-pointer">
              Price (lowest first)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="duration" id="duration" />
            <Label htmlFor="duration" className="cursor-pointer">
              Duration (shortest first)
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Accordion type="multiple" defaultValue={["stops", "airlines", "times"]} className="space-y-2">
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="text-base font-semibold">Price</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4">
              <Slider
                defaultValue={[0, 1000]}
                max={2000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-6"
              />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">${priceRange[0]}</span>
                <span className="text-sm text-gray-600">${priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stops" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="text-base font-semibold">Stops</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2 pb-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="nonstop" />
                <Label htmlFor="nonstop" className="cursor-pointer">
                  Non-stop
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="1stop" />
                <Label htmlFor="1stop" className="cursor-pointer">
                  1 stop
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="2plusstops" />
                <Label htmlFor="2plusstops" className="cursor-pointer">
                  2+ stops
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="airlines" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="text-base font-semibold">Airlines</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2 pb-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="delta" />
                <Label htmlFor="delta" className="cursor-pointer">
                  Delta Air Lines
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="united" />
                <Label htmlFor="united" className="cursor-pointer">
                  United Airlines
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="american" />
                <Label htmlFor="american" className="cursor-pointer">
                  American Airlines
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="southwest" />
                <Label htmlFor="southwest" className="cursor-pointer">
                  Southwest Airlines
                </Label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="times" className="border-b-0">
          <AccordionTrigger className="py-3 hover:no-underline">
            <span className="text-base font-semibold">Times</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pt-2 pb-4">
              <h4 className="text-sm font-medium mb-3">Departure time</h4>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Morning</span>
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Afternoon</span>
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Evening</span>
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Night</span>
                </Button>
              </div>

              <h4 className="text-sm font-medium mb-3">Arrival time</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Morning</span>
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Afternoon</span>
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Evening</span>
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <span className="text-xs">Night</span>
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button variant="outline" className="w-full mt-4 border-gray-300">
        Reset Filters
      </Button>
    </div>
  )
}

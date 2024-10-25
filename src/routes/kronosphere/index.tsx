import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronDown, FolderOpen, Hourglass } from "lucide-solid";
import { createSignal } from "solid-js";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
} from "@/components/ui/text-field";
import { createKronosphere, openExistingKronosphere } from "@/lib/file-system/kronospheres";
import { toastService } from "@/components/toast";
import { useNavigate } from "@solidjs/router";
type Props = {};

export default function Kronosphere(props: Props) {
  const [error, setError] = createSignal<string | null>(null);
  const [value, setValue] = createSignal("");
  const [languageValue, setLanguageValue] = createSignal("en");
  const [kronosphereName, setKronosphereName] = createSignal(""); // State for the input value

  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = createSignal<string | null>(null);

  const handleCreateKronosphere = async () => {
    try {
      const name = kronosphereName();
      if (!name) {
        toastService.warning({
          title: "Validation Error",
          description: "Please enter a name for the Kronosphere.",
        });
        setError("Please enter a name for the Kronosphere.");
        return;
      }
      const kronosphere = await createKronosphere(name);
      if (kronosphere) {
        toastService.success({
          title: "Success",
          description: `Kronosphere "${kronosphere.name}" created successfully!`,
        });
        setSuccessMessage(
          `Kronosphere "${kronosphere.name}" created successfully!`,
        );
        setError(null);
        navigate("/");
      }
    } catch (error) {
      toastService.error({
        title: "Error",
        description: "Failed to create Kronosphere.",
      });
      setError("Failed to create Kronosphere.");
      setSuccessMessage(null);
    }
  };

  const handleOpenKronosphere = async () => {
    try {
      const kronosphere = await openExistingKronosphere();
      if (kronosphere) {
        toastService.success({
          title: "Success",
          description: `Kronosphere "${kronosphere.name}" opened successfully!`,
        });
        navigate("/");
      }
    } catch (error) {
      toastService.error({
        title: "Error",
        description: "Selected directory is not a valid Kronosphere.",
      });
      setError("Failed to open Kronosphere.");
    }
  };

  return (
    <div class="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div class="w-full max-w-md space-y-8">
        <div class="text-center">
          <Hourglass class="mx-auto mb-4 h-16 w-16 text-primary" />
          <h1 class="mb-1 text-3xl font-bold">Kronos</h1>
          <p class="text-sm text-muted-foreground">Version 0.1.0</p>
        </div>

        <div class="space-y-4">
          {/* <Select */}
          {/*   value={languageValue()} */}
          {/*   onChange={setLanguageValue} */}
          {/*   options={["en", "fr", "de"]} */}
          {/*   defaultValue={"en"} */}
          {/*   itemComponent={(props) => ( */}
          {/*     <SelectItem item={props.item}>{props.item.rawValue}</SelectItem> */}
          {/*   )} */}
          {/*   placeholder="Select Language" */}
          {/* > */}
          {/*   <SelectTrigger class="w-full"> */}
          {/*     <SelectValue<string>> */}
          {/*       {(state) => state.selectedOption()} */}
          {/*     </SelectValue> */}
          {/*   </SelectTrigger> */}
          {/*   <SelectContent /> */}
          {/* </Select> */}

          <TextField class="grid w-full  items-center gap-1.5">
            <TextFieldInput
              type="text"
              id="kronosphereName"
              placeholder="Enter Kronosphere Name"
              value={kronosphereName()}
              onInput={(e) => setKronosphereName(e.currentTarget.value)}
              class="w-full"
            />
          </TextField>

          <div class="relative">
            <Button
              class="group w-full  transition-colors hover:bg-primary/90"
              variant="default"
              onClick={handleCreateKronosphere}
            >
              Create new Kronosphere
            </Button>
            <p class="mt-1 text-xs text-muted-foreground">
              Create a new Kronosphere under a folder.
            </p>
          </div>

          {/* <Select
            value={value()}
            onChange={setValue}
            options={["Test"]}
            itemComponent={(props) => (
              <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
            )}
            placeholder="Select previous Kronosphere"
          >
            <SelectTrigger class="w-full">
              <SelectValue<string>>
                {(state) => state.selectedOption()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select> */}

          <div class="relative">
            <Button
              class="group w-full  transition-colors hover:bg-secondary/90"
              variant="secondary"
              onClick={handleOpenKronosphere}
            >
              Open folder as Kronosphere
            </Button>
            <p class="mt-1 text-xs text-muted-foreground">
              Choose an existing folder of Markdown files.
            </p>
          </div>
        </div>


      </div>
    </div>
  );
}

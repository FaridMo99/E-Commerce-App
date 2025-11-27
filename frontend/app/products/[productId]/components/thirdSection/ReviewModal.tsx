"use client"
import InputValidationFailedText from "@/components/main/InputValidationFailedText";
import InteractiveRating from "@/components/main/InteractiveRating";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,Dialog } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProductReviewByProductId } from "@/lib/queries/client/productQueries";
import useAuth from "@/stores/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, ReviewSchema } from "@monorepo/shared";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { JSX, MouseEventHandler } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type ReviewModalProps = {
  buttonText: string | JSX.Element
    clickHandler: MouseEventHandler<HTMLButtonElement>;
  defaultPublic?:boolean
};


export function ReviewModal({ buttonText, clickHandler, defaultPublic }: ReviewModalProps) {
    const { productId } = useParams()
    const accessToken = useAuth(state => state.accessToken)
    const router = useRouter()
    
      const { register, handleSubmit, formState, watch, setValue } = useForm({
        resolver: zodResolver(reviewSchema),
        mode: "onSubmit",
          reValidateMode: "onChange",
          defaultValues: {
            rating:0
        }
      });

    
    
    const { errors } = formState
    console.log(errors)
    
    const {mutate, isPending } = useMutation({
        mutationKey: ["create review for product", productId],
        mutationFn: (review: ReviewSchema) => createProductReviewByProductId(productId as string, review, accessToken!)
        ,
        onSuccess: () => {
            toast.success("Review posted successfully!")
            router.refresh()
        },
        onError: (err) => {
            toast.error(err.message)
        }
    })

    function submitHandler(review: ReviewSchema) {
        console.log("submit runs")
        if (defaultPublic) {
            review.isPublic = true;
        }
        if (accessToken) {
           mutate(review);
        }
        else {
            toast.error("You have to be logged in to create a Review")
        }
    }

  return (
    <Dialog>
        <DialogTrigger asChild>
                  <button
                      type="button"
            className="text-white cursor-pointer hover:text-white/80"
            onClick={clickHandler}
          >
            {buttonText}
          </button>
        </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-backgroundBright text-white">
        <form onSubmit={handleSubmit(submitHandler)}>
          <DialogHeader>
            <DialogTitle>Create a Review</DialogTitle>
            <DialogDescription>
              Rate the Product and give a descriptive Review
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="grid gap-4">
            <Field className="grid gap-3">
              <Label htmlFor="rating">Rating</Label>
                          <InteractiveRating
                    styles="items-start"
                    value={Number(watch("rating")) || 0}
                    onChange={(v) =>
                    setValue("rating", v, {
                        shouldValidate: true,
                        shouldTouch: true,
                    })
                    }
                />
              <InputValidationFailedText
                trigger={errors.rating}
                text={errors.rating?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="title">Title</Label>
              <Input id="title" type="text" {...register("title")} />
              <InputValidationFailedText
                trigger={errors.title}
                text={errors.title?.message}
              />
            </Field>
            <Field className="grid gap-3">
              <Label htmlFor="content">Content</Label>
              <Textarea
                className="overflow-scroll wrap-break-word max-h-50 min-h-40 text-white"
                {...register("content")}
              />
              <InputValidationFailedText
                trigger={errors.content}
                text={errors.content?.message}
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 className="animate-spin text-white" />
              ) : (
                "Submit"
              )}
            </Button>
            </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}
